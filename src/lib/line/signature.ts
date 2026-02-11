import crypto from 'crypto';

const channelSecret = process.env.LINE_CHANNEL_SECRET!;

export function validateSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');
  return hash === signature;
}
