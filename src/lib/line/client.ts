import { messagingApi } from '@line/bot-sdk';

let _lineClient: messagingApi.MessagingApiClient | null = null;
let _lineBlobClient: messagingApi.MessagingApiBlobClient | null = null;

export function getLineClient(): messagingApi.MessagingApiClient {
  if (!_lineClient) {
    _lineClient = new messagingApi.MessagingApiClient({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
    });
  }
  return _lineClient;
}

export function getLineBlobClient(): messagingApi.MessagingApiBlobClient {
  if (!_lineBlobClient) {
    _lineBlobClient = new messagingApi.MessagingApiBlobClient({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
    });
  }
  return _lineBlobClient;
}

// Convenience exports - lazy initialized
export const lineClient = new Proxy({} as messagingApi.MessagingApiClient, {
  get(_target, prop) {
    return (getLineClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const lineBlobClient = new Proxy({} as messagingApi.MessagingApiBlobClient, {
  get(_target, prop) {
    return (getLineBlobClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
