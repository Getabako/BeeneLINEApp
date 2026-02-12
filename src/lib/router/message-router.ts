import { WebhookEvent, MessageEvent, PostbackEvent } from '@line/bot-sdk';
import { lineClient } from '@/lib/line/client';
import { getOrCreateUser } from '@/lib/db/users';
import { getState, setState, resetState } from '@/lib/state/manager';
import { handleSkinDiagnosis } from '@/lib/handlers/skin-diagnosis';
import { handleHealthDiagnosis } from '@/lib/handlers/health-diagnosis';
import { handleMealGuidance } from '@/lib/handlers/meal-guidance';
import { handleDailyReport } from '@/lib/handlers/daily-report';
import { handleFaq } from '@/lib/handlers/faq';
import { handleConsultation } from '@/lib/handlers/consultation';
import { MESSAGES } from '@/lib/constants/messages';
import type { FlowType } from '@/types';

export async function routeEvent(event: WebhookEvent): Promise<void> {
  try {
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
  } catch (error) {
    console.error('Unhandled event processing error:', error);
    const userId = 'source' in event && event.source.userId ? event.source.userId : null;
    if (userId) {
      try {
        await resetState(userId);
        await lineClient.pushMessage({
          to: userId,
          messages: [{ type: 'text', text: MESSAGES.GENERAL_ERROR }],
        });
      } catch (sendError) {
        console.error('Failed to send error recovery message:', sendError);
      }
    }
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

    // Check if user wants to switch to a different flow (even mid-flow)
    const newFlow = detectFlowFromText(text);
    if (newFlow && state.current_flow !== 'idle' && newFlow !== state.current_flow) {
      // User wants to switch flows - reset and start new one
      await resetState(userId);
      await startFlow(newFlow, event, userId);
      return;
    }

    // If in a flow, delegate to handler
    if (state.current_flow !== 'idle') {
      await routeToHandler(state.current_flow, event, userId, text);
      return;
    }

    // Idle: check keywords
    if (newFlow) {
      await startFlow(newFlow, event, userId);
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
  const faqCat = params.get('faq_cat');
  const faqQ = params.get('faq_q');
  const consultCat = params.get('consult_cat');
  const consultQ = params.get('consult_q');

  // FAQ postbacks
  if (faqCat) {
    await handleFaq(event as unknown as MessageEvent, userId, '', faqCat);
    return;
  }
  if (faqQ) {
    await handleFaq(event as unknown as MessageEvent, userId, '', undefined, faqQ);
    return;
  }

  // Consultation postbacks
  if (consultCat) {
    await handleConsultation(event as unknown as MessageEvent, userId, '', consultCat);
    return;
  }
  if (consultQ) {
    await handleConsultation(event as unknown as MessageEvent, userId, '', undefined, consultQ);
    return;
  }

  if (!action) return;

  // Reset current flow when starting a new one from postback
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
    case 'faq':
      await startFlow('faq', event, userId);
      break;
    case 'consultation':
      await startFlow('consultation', event, userId);
      break;
    case 'reservation':
      await startFlow('reservation', event, userId);
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
        messages: [{ type: 'text', text: MESSAGES.HEALTH_ASK_HEIGHT }],
      });
      break;
    case 'meal_analysis': {
      await setState(userId, 'meal_analysis', 1, { awaiting_image: true });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.MEAL_START }],
      });
      break;
    }
    case 'daily_report': {
      await setState(userId, 'daily_report', 1, {});
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.DAILY_REPORT_START }],
      });
      break;
    }
    case 'faq':
      await setState(userId, 'faq', 1, {});
      await handleFaq(event as unknown as MessageEvent, userId, '');
      break;
    case 'consultation':
      await setState(userId, 'consultation', 1, {});
      await handleConsultation(event as unknown as MessageEvent, userId, '');
      break;
    case 'reservation': {
      const { buildStoreCardsMessage } = await import('@/lib/line/message-builder');
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [
          { type: 'text', text: MESSAGES.RESERVATION_PROMPT },
          buildStoreCardsMessage(),
        ],
      });
      await resetState(userId);
      break;
    }
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
    case 'faq':
      await handleFaq(event, userId, text);
      break;
    case 'consultation':
      await handleConsultation(event, userId, text);
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
  if (lower === 'faq' || lower.includes('よくある質問')) return 'faq';
  if (lower.includes('相談')) return 'consultation';
  return null;
}
