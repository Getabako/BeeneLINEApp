import { MessageEvent } from '@line/bot-sdk';
import { lineClient } from '@/lib/line/client';
import { getState, setState, resetState } from '@/lib/state/manager';
import { saveDailyReport, getDailyReports } from '@/lib/db/daily-reports';
import { getGenAI } from '@/lib/openai/client';
import { withTimeout } from '@/lib/utils/timeout';
import { MESSAGES } from '@/lib/constants/messages';
import { BOWEL_OPTIONS, MOOD_OPTIONS } from '@/lib/constants/menus';
import type { DailyReportContext } from '@/types';

export async function handleDailyReport(
  event: MessageEvent,
  userId: string,
  text: string
): Promise<void> {
  const state = await getState(userId);
  const ctx = state.context as unknown as DailyReportContext;

  switch (state.step) {
    // Step 1: Weight
    case 1: {
      const weight = parseFloat(text);
      if (isNaN(weight) || weight < 20 || weight > 300) {
        await lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: MESSAGES.HEALTH_INVALID_NUMBER }],
        });
        return;
      }
      await setState(userId, 'daily_report', 2, { ...ctx, weight });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.DAILY_ASK_SLEEP }],
      });
      break;
    }

    // Step 2: Sleep hours
    case 2: {
      const sleepHours = parseFloat(text);
      if (isNaN(sleepHours) || sleepHours < 0 || sleepHours > 24) {
        await lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: MESSAGES.HEALTH_INVALID_NUMBER }],
        });
        return;
      }
      await setState(userId, 'daily_report', 3, { ...ctx, sleep_hours: sleepHours });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.DAILY_ASK_WATER }],
      });
      break;
    }

    // Step 3: Water intake
    case 3: {
      const waterIntake = parseFloat(text);
      if (isNaN(waterIntake) || waterIntake < 0 || waterIntake > 10) {
        await lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: MESSAGES.HEALTH_INVALID_NUMBER }],
        });
        return;
      }
      await setState(userId, 'daily_report', 4, { ...ctx, water_intake: waterIntake });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: 'template',
            altText: MESSAGES.DAILY_ASK_BOWEL,
            template: {
              type: 'buttons',
              text: MESSAGES.DAILY_ASK_BOWEL,
              actions: BOWEL_OPTIONS.map((opt) => ({
                type: 'message' as const,
                label: opt.label,
                text: opt.label,
              })),
            },
          },
        ],
      });
      break;
    }

    // Step 4: Bowel
    case 4: {
      await setState(userId, 'daily_report', 5, { ...ctx, bowel: text });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: 'template',
            altText: MESSAGES.DAILY_ASK_MOOD,
            template: {
              type: 'buttons',
              text: MESSAGES.DAILY_ASK_MOOD,
              actions: MOOD_OPTIONS.map((opt) => ({
                type: 'message' as const,
                label: opt.label,
                text: opt.label,
              })),
            },
          },
        ],
      });
      break;
    }

    // Step 5: Mood
    case 5: {
      await setState(userId, 'daily_report', 6, { ...ctx, mood: text });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.DAILY_ASK_NOTES }],
      });
      break;
    }

    // Step 6: Notes → save → stagnation detection
    case 6: {
      const notes = text === 'なし' ? undefined : text;
      const fullCtx = { ...ctx, mood: ctx.mood };

      try {
        await saveDailyReport(userId, {
          weight: fullCtx.weight,
          sleep_hours: fullCtx.sleep_hours,
          water_intake: fullCtx.water_intake,
          bowel: fullCtx.bowel,
          mood: fullCtx.mood,
          notes,
        });

        await lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: MESSAGES.DAILY_SAVED }],
        });

        // Stagnation detection & encouragement
        try {
          const reports = await getDailyReports(userId, 7);
          const weightsWithValues = reports.filter((r) => r.weight !== null);
          const needsEncouragement = detectStagnationOrLowMood(weightsWithValues, fullCtx.mood);

          if (needsEncouragement) {
            const encouragement = await generateEncouragement(
              needsEncouragement,
              fullCtx.weight,
              fullCtx.mood
            );
            await lineClient.pushMessage({
              to: userId,
              messages: [{ type: 'text', text: encouragement }],
            });
          }
        } catch (encourageError) {
          console.error('Encouragement generation error:', encourageError);
        }
      } catch (error) {
        console.error('Daily report error:', error);
        await lineClient.pushMessage({
          to: userId,
          messages: [{ type: 'text', text: MESSAGES.GENERAL_ERROR }],
        }).catch((e) => console.error('Failed to send daily report error:', e));
      }

      await resetState(userId);
      break;
    }

    default:
      await resetState(userId);
      break;
  }
}

function detectStagnationOrLowMood(
  reports: { weight: number | null }[],
  currentMood?: string
): 'stagnation' | 'low_mood' | null {
  // Check weight stagnation: 5+ records with < 0.3kg variation
  if (reports.length >= 5) {
    const weights = reports.map((r) => r.weight!).filter((w) => w !== null);
    if (weights.length >= 5) {
      const max = Math.max(...weights);
      const min = Math.min(...weights);
      if (max - min < 0.3) {
        return 'stagnation';
      }
    }
  }

  // Check low mood
  if (currentMood && (currentMood.includes('あまり良くない') || currentMood.includes('悪い'))) {
    return 'low_mood';
  }

  return null;
}

async function generateEncouragement(
  reason: 'stagnation' | 'low_mood',
  weight?: number,
  mood?: string
): Promise<string> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const reasonText =
    reason === 'stagnation'
      ? `体重が${weight}kg前後で停滞しています。`
      : `今日の気分は「${mood}」で、少し落ち込んでいるようです。`;

  const prompt = `あなたはBeeneStyle（美容鍼サロン）の優しいAIカウンセラーです。
ダイエット日報を記録しているユーザーに励ましのメッセージを送ります。

状況: ${reasonText}

以下のルールで励ましメッセージを作成してください:
- 150文字以内
- 共感を示した上で、前向きになれる言葉をかける
- 鍼灸や東洋医学的な視点を一言添えても良い
- 絵文字を1-2個使用

メッセージのみを返してください。`;

  const result = await withTimeout(model.generateContent([{ text: prompt }]), 25000);
  const content = result.response.text();
  return content || '毎日記録を続けているあなたは素晴らしいです！一歩一歩進んでいきましょう✨';
}
