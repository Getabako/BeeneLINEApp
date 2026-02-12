import { MessageEvent } from '@line/bot-sdk';
import { lineClient } from '@/lib/line/client';
import { getFaqResponse } from '@/lib/openai/faq-chat';
import { buildStoreCardsMessage } from '@/lib/line/message-builder';
import { MESSAGES } from '@/lib/constants/messages';
import { FAQ_CATEGORIES, FAQ_ITEMS } from '@/lib/constants/menus';

export async function handleFaq(
  event: MessageEvent,
  userId: string,
  text: string,
  category?: string,
  questionIndex?: string
): Promise<void> {
  const replyToken = (event as { replyToken: string }).replyToken;

  try {
    // Category selected via postback
    if (category) {
      const items = FAQ_ITEMS[category];
      if (!items) return;

      await lineClient.replyMessage({
        replyToken,
        messages: [
          {
            type: 'template',
            altText: '質問を選択してください',
            template: {
              type: 'buttons',
              text: '気になる質問をタップしてください💬',
              actions: items.slice(0, 4).map((item, i) => ({
                type: 'postback' as const,
                label: item.question.slice(0, 20),
                data: `faq_q=${category}_${i}`,
                displayText: item.question,
              })),
            },
          },
        ],
      });
      return;
    }

    // Specific question selected via postback
    if (questionIndex) {
      const [cat, idxStr] = questionIndex.split('_');
      const idx = parseInt(idxStr, 10);
      const items = FAQ_ITEMS[cat];
      if (!items || !items[idx]) return;

      const item = items[idx];
      await lineClient.replyMessage({
        replyToken,
        messages: [
          { type: 'text', text: `Q. ${item.question}\n\n\nA. ${item.answer}` },
          { type: 'text', text: MESSAGES.RESERVATION_PROMPT },
          buildStoreCardsMessage(),
        ],
      });
      return;
    }

    // Initial start or empty text: show category buttons
    if (!text) {
      await lineClient.replyMessage({
        replyToken,
        messages: [
          { type: 'text', text: MESSAGES.FAQ_START },
          {
            type: 'template',
            altText: 'FAQカテゴリ選択',
            template: {
              type: 'buttons',
              text: 'カテゴリを選んでください',
              actions: FAQ_CATEGORIES.map((cat) => ({
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

    // Free text: send "thinking" message first, then AI result via pushMessage
    await lineClient.replyMessage({
      replyToken,
      messages: [{ type: 'text', text: 'AIが回答を準備中です...💭' }],
    });

    try {
      const response = await getFaqResponse(text);
      await lineClient.pushMessage({
        to: userId,
        messages: [
          { type: 'text', text: response },
          { type: 'text', text: MESSAGES.RESERVATION_PROMPT },
          buildStoreCardsMessage(),
        ],
      });
    } catch (aiError) {
      console.error('FAQ AI error:', aiError);
      await lineClient.pushMessage({
        to: userId,
        messages: [{ type: 'text', text: MESSAGES.GENERAL_ERROR }],
      });
    }
  } catch (error) {
    console.error('FAQ error:', error);
    await lineClient.pushMessage({
      to: userId,
      messages: [{ type: 'text', text: MESSAGES.GENERAL_ERROR }],
    }).catch((e) => console.error('Failed to send FAQ error message:', e));
  }
}
