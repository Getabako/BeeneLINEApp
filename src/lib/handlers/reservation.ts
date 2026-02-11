import { MessageEvent } from '@line/bot-sdk';
import { lineClient } from '@/lib/line/client';
import { getState, setState, resetState } from '@/lib/state/manager';
import { supabase } from '@/lib/db/client';
import { MESSAGES } from '@/lib/constants/messages';
import { MENU_TYPES } from '@/lib/constants/menus';
import type { ReservationContext } from '@/types';

export async function handleReservation(
  event: MessageEvent,
  userId: string,
  text: string
): Promise<void> {
  const state = await getState(userId);
  const ctx = state.context as unknown as ReservationContext;

  switch (state.step) {
    // Step 1: Date
    case 1: {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(text)) {
        await lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: MESSAGES.RESERVATION_INVALID_DATE }],
        });
        return;
      }
      const date = new Date(text);
      if (isNaN(date.getTime()) || date < new Date()) {
        await lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: MESSAGES.RESERVATION_INVALID_DATE }],
        });
        return;
      }
      await setState(userId, 'reservation', 2, { ...ctx, date: text });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: MESSAGES.RESERVATION_ASK_TIME }],
      });
      break;
    }

    // Step 2: Time
    case 2: {
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(text)) {
        await lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: MESSAGES.RESERVATION_INVALID_TIME }],
        });
        return;
      }
      await setState(userId, 'reservation', 3, { ...ctx, time: text });
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: 'template',
            altText: MESSAGES.RESERVATION_ASK_MENU,
            template: {
              type: 'buttons',
              text: MESSAGES.RESERVATION_ASK_MENU,
              actions: MENU_TYPES.slice(0, 4).map((menu) => ({
                type: 'message' as const,
                label: menu.label,
                text: menu.label,
              })),
            },
          },
        ],
      });
      break;
    }

    // Step 3: Menu → save
    case 3: {
      const fullCtx = { ...ctx, menu_type: text };

      try {
        const { error } = await supabase.from('reservations').insert({
          line_user_id: userId,
          reservation_date: fullCtx.date,
          reservation_time: fullCtx.time,
          menu_type: fullCtx.menu_type,
          status: 'pending',
        });

        if (error) throw error;

        const confirmText = `${MESSAGES.RESERVATION_CONFIRMED}\n\n📅 日付: ${fullCtx.date}\n⏰ 時間: ${fullCtx.time}\n💆 メニュー: ${fullCtx.menu_type}`;

        await lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: confirmText }],
        });
      } catch (error) {
        console.error('Reservation error:', error);
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
