import { MessageEvent } from '@line/bot-sdk';
import { lineClient, lineBlobClient } from '@/lib/line/client';
import { analyzeSkinImage } from '@/lib/openai/skin-diagnosis';
import { saveSkinLog } from '@/lib/db/skin-logs';
import { resetState } from '@/lib/state/manager';
import { buildSkinResultMessage } from '@/lib/line/message-builder';
import { MESSAGES } from '@/lib/constants/messages';

export async function handleSkinDiagnosis(event: MessageEvent, userId: string): Promise<void> {
  if (event.message.type !== 'image') return;

  // Send "analyzing" message
  await lineClient.replyMessage({
    replyToken: event.replyToken,
    messages: [{ type: 'text', text: MESSAGES.SKIN_DIAGNOSIS_ANALYZING }],
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
    const result = await analyzeSkinImage(imageBase64);

    // Save to database
    await saveSkinLog(userId, result);

    // Send result as Flex Message
    const flexMessage = buildSkinResultMessage(result);
    await lineClient.pushMessage({
      to: userId,
      messages: [flexMessage],
    });

    // Reset conversation state
    await resetState(userId);
  } catch (error) {
    console.error('Skin diagnosis error:', error);
    await lineClient.pushMessage({
      to: userId,
      messages: [{ type: 'text', text: MESSAGES.SKIN_DIAGNOSIS_ERROR }],
    });
  }
}
