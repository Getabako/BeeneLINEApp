import { lineClient } from './client';
import { messagingApi } from '@line/bot-sdk';

type RichMenuRequest = messagingApi.RichMenuRequest;

const MENU_WIDTH = 2500;
const MENU_HEIGHT = 1686;
const COL = 3;
const ROW = 2;
const cellWidth = Math.floor(MENU_WIDTH / COL);
const cellHeight = Math.floor(MENU_HEIGHT / ROW);

function createArea(col: number, row: number, action: string, label: string, type: 'postback' | 'uri' = 'postback') {
  const x = col * cellWidth;
  const y = row * cellHeight;

  if (type === 'uri') {
    return {
      bounds: { x, y, width: cellWidth, height: cellHeight },
      action: {
        type: 'uri' as const,
        label,
        uri: 'https://beenestyle.com/column',
      },
    };
  }

  return {
    bounds: { x, y, width: cellWidth, height: cellHeight },
    action: {
      type: 'postback' as const,
      label,
      data: `action=${action}`,
      displayText: label,
    },
  };
}

export function createFreeMenuRequest(): RichMenuRequest {
  return {
    size: { width: MENU_WIDTH, height: MENU_HEIGHT },
    selected: true,
    name: 'BeeneStyle 無料会員メニュー',
    chatBarText: 'メニューを開く',
    areas: [
      createArea(0, 0, 'skin_diagnosis', '肌診断'),
      createArea(1, 0, 'health_diagnosis', '体重診断'),
      createArea(2, 0, 'faq', 'FAQ'),
      createArea(0, 1, 'reservation', '予約'),
      createArea(1, 1, 'column', 'コラム', 'uri'),
      createArea(2, 1, 'contact', 'お問合せ'),
    ],
  };
}

export function createPaidMenuRequest(): RichMenuRequest {
  return {
    size: { width: MENU_WIDTH, height: MENU_HEIGHT },
    selected: true,
    name: 'BeeneStyle 有料会員メニュー',
    chatBarText: 'メニューを開く',
    areas: [
      createArea(0, 0, 'meal_analysis', '食事記録'),
      createArea(1, 0, 'daily_report', '日報'),
      createArea(2, 0, 'skin_diagnosis', '肌診断'),
      createArea(0, 1, 'reservation', '予約'),
      createArea(1, 1, 'progress', '経過'),
      createArea(2, 1, 'consultation', '相談'),
    ],
  };
}

export async function switchRichMenu(userId: string, membership: 'free' | 'paid'): Promise<void> {
  // This function requires that rich menu IDs are stored after creation
  // In production, store these IDs in env vars or database
  const freeMenuId = process.env.RICH_MENU_FREE_ID;
  const paidMenuId = process.env.RICH_MENU_PAID_ID;

  const menuId = membership === 'paid' ? paidMenuId : freeMenuId;
  if (!menuId) {
    console.warn('Rich menu ID not configured');
    return;
  }

  await lineClient.linkRichMenuIdToUser(userId, menuId);
}
