import { MessageEvent } from '@line/bot-sdk';
import { lineClient } from '@/lib/line/client';
import { getGenAI } from '@/lib/openai/client';
import { buildStoreCardsMessage } from '@/lib/line/message-builder';
import { MESSAGES } from '@/lib/constants/messages';
import { CONSULTATION_CATEGORIES, CONSULTATION_ITEMS } from '@/lib/constants/menus';

const CONSULTATION_SYSTEM_PROMPT = `あなたはBeeneStyle（ビーネスタイル）の美容・健康カウンセラーAIです。
Beeneは秋田を拠点とする美容鍼サロンで、以下のサービスを提供しています：
- 肌育・小顔美容鍼premium（EXO美容鍼）：40歳以上向け
- 肌育美容鍼・小顔美容鍼：初心者向け
- 鍼灸ダイエット：無理のない体型改善
- 小顔マッサージ、アロマ付きヘッドスパ

特徴：髪の毛より細い極細鍼で痛みがほぼない、ダウンタイムなし、国家資格保有の鍼灸師が施術。

ユーザーの悩みに寄り添い、東洋医学の観点からアドバイスしてください。
回答は200文字以内で簡潔に。最後に必ず「詳しくは店舗でカウンセリングを受けてみてくださいね」と予約を促してください。`;

// Pre-defined answers for button-based consultations
const CONSULT_ANSWERS: Record<string, string> = {
  spots: 'シミ・くすみは、血行不良やターンオーバーの乱れが原因のことが多いです。美容鍼は顔の血流を改善し、肌の新陳代謝を促進します。EXO美容鍼では特にシミへのアプローチに力を入れています。',
  sagging: 'たるみ・ほうれい線は、表情筋の衰えとコラーゲンの減少が主な原因です。美容鍼で筋肉に直接アプローチし、リフトアップ効果が期待できます。小顔矯正との組み合わせが特におすすめです。',
  acne: 'ニキビ・肌荒れは、東洋医学では体内の「熱」や「湿」のバランスの乱れと考えます。美容鍼は体の内側から巡りを整え、肌荒れの根本改善を目指します。',
  dry: '乾燥は「血虚（けっきょ）」つまり血の巡りが悪い状態が原因のことが多いです。美容鍼で顔の血流を改善すると、肌への栄養供給が増え、潤いアップが期待できます。',
  weight: '体重が落ちにくいのは、基礎代謝の低下や自律神経の乱れが関係していることが多いです。鍼灸ダイエットでは、ツボ刺激で代謝を上げ、食欲をコントロールしやすい体づくりをサポートします。',
  meal_manage: '食事管理は継続が大切です。当サロンではAI食事解析機能で毎日の食事を記録・分析できます。東洋医学の「温活」の観点から、体を温める食材を中心にした食事をおすすめしています。',
  rebound: 'リバウンドは急激なダイエットで起こりやすいです。鍼灸ダイエットは体質改善がベースなので、ゆっくりですがリバウンドしにくい体づくりができます。',
  partial: '部分痩せには、その部位の血流改善が重要です。鍼灸で気になる部位の代謝を促進し、ボディケアとの組み合わせで効果的にアプローチできます。',
  cold: '冷え性は東洋医学が最も得意とする分野の一つです。お灸やツボ刺激で体の芯から温め、血流を改善します。継続的な施術で冷えにくい体質へと変化していきます。',
  sleep: '睡眠の質が悪いのは、自律神経の乱れが大きな原因です。美容鍼やヘッドスパでリラックス効果を高め、良質な睡眠へ導きます。多くの方が施術後「よく眠れた」と実感されています。',
  stiff: '肩こり・頭痛は、筋肉の緊張と血流の悪化が原因です。鍼灸は筋肉の深部にアプローチでき、マッサージでは届かない部分のコリもほぐします。',
  fatigue: '慢性的な疲れは「気虚（ききょ）」というエネルギー不足の状態です。鍼灸で体のエネルギーの巡りを整え、自然治癒力を高めることで、疲れにくい体づくりをサポートします。',
  interest: '美容鍼は、髪の毛より細い極細鍼を使うので痛みはほぼありません。施術時間は約60分、ダウンタイムもほぼなく、施術後すぐにメイクもOKです。まずは体験コースからお試しください！',
  first_time: '初めてでご不安なお気持ち、よくわかります。当サロンでは施術前にしっかりカウンセリングを行い、お悩みや体質に合わせたプランをご提案します。痛みもほとんどないので安心してください。',
  recommend: 'お悩みに合わせて最適なメニューをご提案します。まずは店舗でのカウンセリングで、肌や体の状態を詳しく確認させてください。AI肌診断の結果もお持ちいただくとスムーズです。',
};

export async function handleConsultation(
  event: MessageEvent,
  userId: string,
  text: string,
  category?: string,
  questionKey?: string
): Promise<void> {
  const replyToken = (event as { replyToken: string }).replyToken;

  try {
    // Category selected via postback → show sub-questions
    if (category) {
      const items = CONSULTATION_ITEMS[category];
      if (!items) return;

      await lineClient.replyMessage({
        replyToken,
        messages: [
          {
            type: 'template',
            altText: 'お悩みを選択してください',
            template: {
              type: 'buttons',
              text: '具体的なお悩みを選んでください✨',
              actions: items.slice(0, 4).map((item) => ({
                type: 'postback' as const,
                label: item.question.slice(0, 20),
                data: item.data,
                displayText: item.question,
              })),
            },
          },
        ],
      });
      return;
    }

    // Specific question selected via postback → answer + store cards
    if (questionKey) {
      const answer = CONSULT_ANSWERS[questionKey];
      if (!answer) return;

      await lineClient.replyMessage({
        replyToken,
        messages: [
          { type: 'text', text: `${answer}\n\n詳しくは店舗でカウンセリングを受けてみてくださいね😊` },
          { type: 'text', text: MESSAGES.RESERVATION_PROMPT },
          buildStoreCardsMessage(),
        ],
      });
      return;
    }

    // Initial: show category buttons
    if (!text) {
      await lineClient.replyMessage({
        replyToken,
        messages: [
          { type: 'text', text: MESSAGES.CONSULTATION_START },
          {
            type: 'template',
            altText: '相談カテゴリ選択',
            template: {
              type: 'buttons',
              text: 'お悩みのカテゴリを選んでください',
              actions: CONSULTATION_CATEGORIES.map((cat) => ({
                type: 'postback' as const,
                label: cat.label,
                data: cat.data,
                displayText: cat.label,
              })),
            },
          },
        ],
      });
      return;
    }

    // Free text: AI response
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: CONSULTATION_SYSTEM_PROMPT,
    });

    const result = await model.generateContent(text);
    const response = result.response.text() ?? 'すみません、応答を生成できませんでした。';

    await lineClient.replyMessage({
      replyToken,
      messages: [
        { type: 'text', text: response },
        { type: 'text', text: MESSAGES.RESERVATION_PROMPT },
        buildStoreCardsMessage(),
      ],
    });
  } catch (error) {
    console.error('Consultation error:', error);
    await lineClient.replyMessage({
      replyToken,
      messages: [{ type: 'text', text: MESSAGES.GENERAL_ERROR }],
    });
  }
}
