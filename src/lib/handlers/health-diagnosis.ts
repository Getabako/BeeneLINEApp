import { MessageEvent } from '@line/bot-sdk';
import { lineClient } from '@/lib/line/client';
import { getState, setState, resetState } from '@/lib/state/manager';
import { updateUser } from '@/lib/db/users';
import { analyzeHealthComprehensive } from '@/lib/openai/health-diagnosis';
import { buildHealthBmiMessage, buildHealthComprehensiveResultMessage, buildStoreCardsMessage } from '@/lib/line/message-builder';
import { MESSAGES } from '@/lib/constants/messages';
import { HEALTH_CONCERN_OPTIONS, HEALTH_PROGRAM_OPTIONS } from '@/lib/constants/menus';
import type { HealthDiagnosisContext } from '@/types';

function calculateBmi(heightCm: number, weightKg: number) {
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  const idealWeight = Math.round(heightM * heightM * 22 * 10) / 10;
  const weightDiff = Math.round((weightKg - idealWeight) * 10) / 10;

  let obesityLevel: string;
  if (bmi < 18.5) {
    obesityLevel = '低体重';
  } else if (bmi < 25) {
    obesityLevel = '普通体重';
  } else if (bmi < 30) {
    obesityLevel = '肥満1度';
  } else if (bmi < 35) {
    obesityLevel = '肥満2度';
  } else if (bmi < 40) {
    obesityLevel = '肥満3度';
  } else {
    obesityLevel = '肥満4度';
  }

  return { bmi, obesityLevel, idealWeight, weightDiff };
}

export async function handleHealthDiagnosis(
  event: MessageEvent,
  userId: string,
  text: string
): Promise<void> {
  const state = await getState(userId);
  const ctx = state.context as unknown as HealthDiagnosisContext;

  switch (state.step) {
    // Step 1: Ask height
    case 1: {
      const height = parseFloat(text);
      if (isNaN(height) || height < 50 || height > 250) {
        await lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: MESSAGES.HEALTH_INVALID_NUMBER }],
        });
        return;
      }
      await setState(userId, 'health_diagnosis', 2, { ...ctx, height });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.HEALTH_ASK_WEIGHT }],
      });
      break;
    }

    // Step 2: Ask weight → BMI即時計算・結果カード表示
    case 2: {
      const weight = parseFloat(text);
      if (isNaN(weight) || weight < 20 || weight > 300) {
        await lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: MESSAGES.HEALTH_INVALID_NUMBER }],
        });
        return;
      }

      const { bmi, obesityLevel, idealWeight, weightDiff } = calculateBmi(ctx.height!, weight);

      // Update user profile
      await updateUser(userId, { height: ctx.height, weight });

      const newCtx = {
        ...ctx,
        weight,
        bmi,
        obesity_level: obesityLevel,
        ideal_weight: idealWeight,
        weight_diff: weightDiff,
      };
      await setState(userId, 'health_diagnosis', 3, newCtx);

      const bmiCard = buildHealthBmiMessage({
        height: ctx.height!,
        weight,
        bmi,
        obesity_level: obesityLevel,
        ideal_weight: idealWeight,
        weight_diff: weightDiff,
      });

      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [
          bmiCard,
          { type: 'text', text: MESSAGES.HEALTH_ASK_DIET_HISTORY },
        ],
      });
      break;
    }

    // Step 3: ダイエット履歴（自由入力）
    case 3: {
      const dietHistory = text === 'なし' ? 'なし' : text;
      await setState(userId, 'health_diagnosis', 4, { ...ctx, diet_history: dietHistory });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: 'template',
            altText: MESSAGES.HEALTH_ASK_CONCERNS,
            template: {
              type: 'buttons',
              text: MESSAGES.HEALTH_ASK_CONCERNS,
              actions: HEALTH_CONCERN_OPTIONS.map((opt) => ({
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

    // Step 4: 現在の悩み（ボタン4択）
    case 4: {
      await setState(userId, 'health_diagnosis', 5, { ...ctx, current_concerns: text });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: 'template',
            altText: MESSAGES.HEALTH_ASK_PROGRAM,
            template: {
              type: 'buttons',
              text: MESSAGES.HEALTH_ASK_PROGRAM,
              actions: HEALTH_PROGRAM_OPTIONS.map((opt) => ({
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

    // Step 5: プログラムで知りたいこと → Gemini総合分析 → 結果カード → カウンセリング案内 → 店舗カード
    case 5: {
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.HEALTH_ANALYZING }],
      });

      try {
        const result = await analyzeHealthComprehensive({
          height: ctx.height!,
          weight: ctx.weight!,
          bmi: ctx.bmi!,
          obesity_level: ctx.obesity_level!,
          weight_diff: ctx.weight_diff!,
          diet_history: ctx.diet_history || 'なし',
          current_concerns: ctx.current_concerns || '',
          program_question: text,
        });

        const comprehensiveCard = buildHealthComprehensiveResultMessage(result);

        await lineClient.pushMessage({
          to: userId,
          messages: [
            comprehensiveCard,
            { type: 'text', text: MESSAGES.HEALTH_COUNSELING_CTA },
            buildStoreCardsMessage(),
          ],
        });
      } catch (error) {
        console.error('Health comprehensive analysis error:', error);
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
