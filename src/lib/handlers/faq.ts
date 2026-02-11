import { MessageEvent } from '@line/bot-sdk';
import { lineClient } from '@/lib/line/client';
import { getFaqResponse } from '@/lib/openai/faq-chat';
import { MESSAGES } from '@/lib/constants/messages';

export async function handleFaq(
  event: MessageEvent,
  userId: string,
  text: string
): Promise<void> {
  try {
    const response = await getFaqResponse(text);

    await lineClient.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: response }],
    });
  } catch (error) {
    console.error('FAQ error:', error);
    await lineClient.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: MESSAGES.GENERAL_ERROR }],
    });
  }
}
