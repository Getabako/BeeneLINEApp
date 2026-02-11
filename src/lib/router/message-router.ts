import { WebhookEvent, MessageEvent, PostbackEvent } from '@line/bot-sdk';
import { lineClient } from '@/lib/line/client';
import { getOrCreateUser } from '@/lib/db/users';
import { getState, setState, resetState } from '@/lib/state/manager';
import { handleSkinDiagnosis } from '@/lib/handlers/skin-diagnosis';
import { handleHealthDiagnosis } from '@/lib/handlers/health-diagnosis';
import { handleMealGuidance } from '@/lib/handlers/meal-guidance';
import { handleDailyReport } from '@/lib/handlers/daily-report';
import { handleReservation } from '@/lib/handlers/reservation';
import { handleFaq } from '@/lib/handlers/faq';
import { MESSAGES } from '@/lib/constants/messages';
import type { FlowType } from '@/types';

export async function routeEvent(event: WebhookEvent): Promise<void> {
  if (event.type === 'follow') {
    await handleFollow(event);
    return;
  }

  if (event.type === 'message') {
    await handleMessage(event);
    return;
  }

  if (event.type === 'postback') {
    await handlePostback(event);
    return;
  }
}

async function handleFollow(event: WebhookEvent): Promise<void> {
  if (!('source' in event) || !event.source.userId) return;
  const userId = event.source.userId;

  const profile = await lineClient.getProfile(userId);
  await getOrCreateUser(userId, profile.displayName);

  await lineClient.replyMessage({
    replyToken: (event as { replyToken: string }).replyToken,
    messages: [{ type: 'text', text: MESSAGES.WELCOME }],
  });
}

async function handleMessage(event: MessageEvent): Promise<void> {
  const userId = event.source.userId;
  if (!userId) return;

  await getOrCreateUser(userId);
  const state = await getState(userId);

  // Image messages
  if (event.message.type === 'image') {
    await routeImageMessage(event, state.current_flow, userId);
    return;
  }

  // Text messages
  if (event.message.type === 'text') {
    const text = event.message.text.trim();

    // If user is in a flow, delegate to that handler
    if (state.current_flow !== 'idle') {
      await routeToHandler(state.current_flow, event, userId, text);
      return;
    }

    // Check for keyword-based flow triggers
    const flow = detectFlowFromText(text);
    if (flow) {
      await startFlow(flow, event, userId);
      return;
    }

    // Default: FAQ/general chat
    await handleFaq(event, userId, text);
  }
}

async function handlePostback(event: PostbackEvent): Promise<void> {
  const userId = event.source.userId;
  if (!userId) return;

  await getOrCreateUser(userId);

  const params = new URLSearchParams(event.postback.data);
  const action = params.get('action');

  if (!action) return;

  // Reset any current flow when starting a new one from postback
  await resetState(userId);

  switch (action) {
    case 'skin_diagnosis':
      await startFlow('skin_diagnosis', event, userId);
      break;
    case 'health_diagnosis':
      await startFlow('health_diagnosis', event, userId);
      break;
    case 'meal_analysis':
      await startFlow('meal_analysis', event, userId);
      break;
    case 'daily_report':
      await startFlow('daily_report', event, userId);
      break;
    case 'reservation':
      await startFlow('reservation', event, userId);
      break;
    case 'faq':
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.FAQ_START }],
      });
      break;
    case 'contact':
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.CONTACT }],
      });
      break;
    case 'image_skin':
      await setState(userId, 'skin_diagnosis', 1, { awaiting_image: true });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.SKIN_DIAGNOSIS_START }],
      });
      break;
    case 'image_meal':
      await setState(userId, 'meal_analysis', 1, { awaiting_image: true });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.MEAL_START }],
      });
      break;
    default:
      break;
  }
}

async function startFlow(flow: FlowType, event: WebhookEvent & { replyToken: string }, userId: string): Promise<void> {
  switch (flow) {
    case 'skin_diagnosis':
      await setState(userId, 'skin_diagnosis', 1, { awaiting_image: true });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.SKIN_DIAGNOSIS_START }],
      });
      break;
    case 'health_diagnosis':
      await setState(userId, 'health_diagnosis', 1, {});
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.HEALTH_ASK_AGE }],
      });
      break;
    case 'meal_analysis': {
      const user = await getOrCreateUser(userId);
      if (user.membership !== 'paid') {
        await lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: MESSAGES.MEAL_PAID_ONLY }],
        });
        return;
      }
      await setState(userId, 'meal_analysis', 1, { awaiting_image: true });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.MEAL_START }],
      });
      break;
    }
    case 'daily_report': {
      const user = await getOrCreateUser(userId);
      if (user.membership !== 'paid') {
        await lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: MESSAGES.DAILY_PAID_ONLY }],
        });
        return;
      }
      await setState(userId, 'daily_report', 1, {});
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.DAILY_REPORT_START }],
      });
      break;
    }
    case 'reservation':
      await setState(userId, 'reservation', 1, {});
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.RESERVATION_START }],
      });
      break;
    default:
      break;
  }
}

async function routeImageMessage(
  event: MessageEvent,
  currentFlow: string,
  userId: string
): Promise<void> {
  switch (currentFlow) {
    case 'skin_diagnosis':
      await handleSkinDiagnosis(event, userId);
      break;
    case 'meal_analysis':
      await handleMealGuidance(event, userId);
      break;
    default:
      // idle: ask what the image is for
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [
          { type: 'text', text: MESSAGES.IMAGE_ASK_PURPOSE },
          {
            type: 'template',
            altText: '画像の用途を選択',
            template: {
              type: 'buttons',
              text: 'この画像を何に使いますか？',
              actions: [
                { type: 'postback', label: '肌診断', data: 'action=image_skin' },
                { type: 'postback', label: '食事解析', data: 'action=image_meal' },
              ],
            },
          },
        ],
      });
      break;
  }
}

async function routeToHandler(
  flow: string,
  event: MessageEvent,
  userId: string,
  text: string
): Promise<void> {
  switch (flow) {
    case 'health_diagnosis':
      await handleHealthDiagnosis(event, userId, text);
      break;
    case 'daily_report':
      await handleDailyReport(event, userId, text);
      break;
    case 'reservation':
      await handleReservation(event, userId, text);
      break;
    default:
      await handleFaq(event, userId, text);
      break;
  }
}

function detectFlowFromText(text: string): FlowType | null {
  const lower = text.toLowerCase();
  if (lower.includes('肌診断') || lower.includes('肌分析')) return 'skin_diagnosis';
  if (lower.includes('体重') || lower.includes('bmi') || lower.includes('健康診断')) return 'health_diagnosis';
  if (lower.includes('食事') || lower.includes('栄養')) return 'meal_analysis';
  if (lower.includes('日報') || lower.includes('記録')) return 'daily_report';
  if (lower.includes('予約')) return 'reservation';
  return null;
}
