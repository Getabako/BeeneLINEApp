import { MessageEvent } from '@line/bot-sdk';
import { lineClient, lineBlobClient } from '@/lib/line/client';
import { analyzeMealImage } from '@/lib/openai/meal-analysis';
import { saveMealLog } from '@/lib/db/meal-logs';
import { resetState } from '@/lib/state/manager';
import { buildMealResultMessage } from '@/lib/line/message-builder';
import { MESSAGES } from '@/lib/constants/messages';

export async function handleMealGuidance(event: MessageEvent, userId: string): Promise<void> {
  if (event.message.type !== 'image') return;

  await lineClient.replyMessage({
    replyToken: event.replyToken,
    messages: [{ type: 'text', text: MESSAGES.MEAL_ANALYZING }],
  });

  try {
    // Get image content from LINE
    const stream = await lineBlobClient.getMessageContent(event.message.id);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const imageBuffer = Buffer.concat(chunks);
    const imageBase64 = imageBuffer.toString('base64');

    // Analyze with OpenAI Vision
    const result = await analyzeMealImage(imageBase64);

    // Save to database
    await saveMealLog(userId, result);

    // Send result
    const flexMessage = buildMealResultMessage(result);
    await lineClient.pushMessage({
      to: userId,
      messages: [flexMessage],
    });

    await resetState(userId);
  } catch (error) {
    console.error('Meal analysis error:', error);
    await lineClient.pushMessage({
      to: userId,
      messages: [{ type: 'text', text: MESSAGES.MEAL_ERROR }],
    });
  }
}
