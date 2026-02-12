import { NextRequest, NextResponse } from 'next/server';
import { WebhookEvent } from '@line/bot-sdk';
import { validateSignature } from '@/lib/line/signature';
import { routeEvent } from '@/lib/router/message-router';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-line-signature');

    if (!signature || !validateSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const parsed = JSON.parse(body);
    const events: WebhookEvent[] = parsed.events;

    // Process all events - await to keep the function alive
    // Use allSettled so one event's failure doesn't block others
    const results = await Promise.allSettled(
      events.map((event) => routeEvent(event))
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('Event processing error:', result.reason);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
