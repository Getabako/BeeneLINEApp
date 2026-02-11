import { MessageEvent } from '@line/bot-sdk';
import { lineClient } from '@/lib/line/client';
import { getState, setState, resetState } from '@/lib/state/manager';
import { saveDailyReport } from '@/lib/db/daily-reports';
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

    // Step 6: Notes → save
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
      } catch (error) {
        console.error('Daily report error:', error);
        await lineClient.replyMessage({
          replyToken: event.replyToken,
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
