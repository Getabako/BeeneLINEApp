import { MessageEvent } from '@line/bot-sdk';
import { lineClient } from '@/lib/line/client';
import { getState, setState, resetState, updateContext } from '@/lib/state/manager';
import { updateUser } from '@/lib/db/users';
import { analyzeHealth } from '@/lib/openai/health-diagnosis';
import { buildHealthResultMessage } from '@/lib/line/message-builder';
import { MESSAGES } from '@/lib/constants/messages';
import { GENDER_OPTIONS } from '@/lib/constants/menus';
import type { HealthDiagnosisContext } from '@/types';

export async function handleHealthDiagnosis(
  event: MessageEvent,
  userId: string,
  text: string
): Promise<void> {
  const state = await getState(userId);
  const ctx = state.context as unknown as HealthDiagnosisContext;

  switch (state.step) {
    // Step 1: Ask age
    case 1: {
      const age = parseInt(text, 10);
      if (isNaN(age) || age < 1 || age > 120) {
        await lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: MESSAGES.HEALTH_INVALID_NUMBER }],
        });
        return;
      }
      await updateContext(userId, { age });
      await setState(userId, 'health_diagnosis', 2, { ...ctx, age });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: 'template',
            altText: MESSAGES.HEALTH_ASK_GENDER,
            template: {
              type: 'buttons',
              text: MESSAGES.HEALTH_ASK_GENDER,
              actions: GENDER_OPTIONS.map((opt) => ({
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

    // Step 2: Ask gender
    case 2: {
      const gender = text;
      await setState(userId, 'health_diagnosis', 3, { ...ctx, gender });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.HEALTH_ASK_HEIGHT }],
      });
      break;
    }

    // Step 3: Ask height
    case 3: {
      const height = parseFloat(text);
      if (isNaN(height) || height < 50 || height > 250) {
        await lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: MESSAGES.HEALTH_INVALID_NUMBER }],
        });
        return;
      }
      await setState(userId, 'health_diagnosis', 4, { ...ctx, height });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.HEALTH_ASK_WEIGHT }],
      });
      break;
    }

    // Step 4: Ask weight → analyze
    case 4: {
      const weight = parseFloat(text);
      if (isNaN(weight) || weight < 20 || weight > 300) {
        await lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: MESSAGES.HEALTH_INVALID_NUMBER }],
        });
        return;
      }

      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.HEALTH_ANALYZING }],
      });

      try {
        const fullCtx = { ...ctx, weight };
        const result = await analyzeHealth(
          fullCtx.age!,
          fullCtx.gender!,
          fullCtx.height!,
          fullCtx.weight!
        );

        // Update user profile
        await updateUser(userId, {
          age: fullCtx.age,
          gender: fullCtx.gender,
          height: fullCtx.height,
          weight: fullCtx.weight,
        });

        const flexMessage = buildHealthResultMessage(result);
        await lineClient.pushMessage({
          to: userId,
          messages: [flexMessage],
        });
      } catch (error) {
        console.error('Health diagnosis error:', error);
        await lineClient.pushMessage({
          to: userId,
          messages: [{ type: 'text', text: MESSAGES.GENERAL_ERROR }],
        });
      }

      await resetState(userId);
      break;
    }

    default:
      await resetState(userId);
      break;
  }
}
