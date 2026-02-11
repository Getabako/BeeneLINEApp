import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import { lineClient } from '@/lib/line/client';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('line_user_id, display_name, registered_at, membership');

    if (error) throw error;
    if (!users || users.length === 0) {
      return NextResponse.json({ status: 'ok', delivered: 0 });
    }

    let delivered = 0;

    for (const user of users) {
      const daysSinceRegistration = Math.floor(
        (Date.now() - new Date(user.registered_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      const message = getStepMessage(daysSinceRegistration, user.membership, user.display_name);
      if (!message) continue;

      try {
        await lineClient.pushMessage({
          to: user.line_user_id,
          messages: [{ type: 'text', text: message }],
        });
        delivered++;
      } catch (err) {
        console.error(`Failed to send to ${user.line_user_id}:`, err);
      }
    }

    return NextResponse.json({ status: 'ok', delivered });
  } catch (error) {
    console.error('Step delivery error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getStepMessage(
  days: number,
  membership: string,
  displayName: string | null
): string | null {
  const name = displayName ?? 'お客様';

  switch (days) {
    case 1:
      return `${name}さん、BeeneStyleへのご登録ありがとうございます！🌿\n\nまずはAI肌診断を試してみませんか？お顔の写真を送るだけで、肌状態を詳しく分析できます✨\n\nメニューの「肌診断」からお試しください！`;

    case 3:
      return `${name}さん、こんにちは！\n\n健康体重診断はもうお試しになりましたか？BMIや理想体重を算出し、東洋医学的なアドバイスもお伝えします💪\n\nメニューの「体重診断」からどうぞ！`;

    case 7:
      if (membership === 'free') {
        return `${name}さん、BeeneStyleをご利用いただき1週間が経ちました🎉\n\n有料プランにアップグレードすると、以下の機能が使えるようになります：\n・🍽️ AI食事解析（東洋医学×栄養学）\n・📊 ダイエット日報\n・📈 経過グラフ\n\n詳しくはスタッフにお問い合わせください！`;
      }
      return `${name}さん、有料プランをご利用いただき1週間です！\n\n毎日の日報記録は続けていますか？📝\n継続が美と健康の秘訣です。今日も頑張りましょう！`;

    case 14:
      return `${name}さん、2週間が経ちました！\n\n肌の変化を感じていますか？定期的にAI肌診断を行うと、改善の様子がわかりますよ🔍\n\nメニューの「肌診断」から再診断してみてください！`;

    case 30:
      return `${name}さん、1ヶ月が経ちました！🎊\n\nそろそろプロのカウンセリングを受けてみませんか？\nAI診断の結果をもとに、専門スタッフが最適なプランをご提案します。\n\nメニューの「予約」からご予約ください📅`;

    default:
      return null;
  }
}
