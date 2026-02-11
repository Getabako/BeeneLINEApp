/**
 * リッチメニューセットアップスクリプト
 *
 * 使い方:
 *   npx tsx scripts/setup-rich-menu.ts
 *
 * 事前準備:
 *   1. .env.local に LINE_CHANNEL_ACCESS_TOKEN を設定
 *   2. リッチメニュー画像を用意 (2500x1686px)
 *      - scripts/rich-menu-free.png (無料会員用)
 *      - scripts/rich-menu-paid.png (有料会員用)
 */

import { messagingApi } from '@line/bot-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN!;

if (!channelAccessToken) {
  console.error('LINE_CHANNEL_ACCESS_TOKEN is not set in .env.local');
  process.exit(1);
}

const client = new messagingApi.MessagingApiClient({ channelAccessToken });
const blobClient = new messagingApi.MessagingApiBlobClient({ channelAccessToken });

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
      action: { type: 'uri' as const, label, uri: 'https://beenestyle.com/column' },
    };
  }

  return {
    bounds: { x, y, width: cellWidth, height: cellHeight },
    action: { type: 'postback' as const, label, data: `action=${action}`, displayText: label },
  };
}

async function main() {
  console.log('=== BeeneStyle リッチメニュー セットアップ ===\n');

  // Delete existing rich menus
  console.log('既存のリッチメニューを削除中...');
  const existingResponse = await client.getRichMenuList();
  const existingMenus = existingResponse.richmenus ?? [];
  for (const menu of existingMenus) {
    await client.deleteRichMenu(menu.richMenuId);
    console.log(`  削除: ${menu.richMenuId} (${menu.name})`);
  }

  // Create free member menu
  console.log('\n無料会員メニューを作成中...');
  const freeMenuId = await client.createRichMenu({
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
  });
  console.log(`  作成完了: ${freeMenuId.richMenuId}`);

  // Upload free menu image if exists
  const freeImagePath = path.join(__dirname, 'rich-menu-free.png');
  if (fs.existsSync(freeImagePath)) {
    const imageData = fs.readFileSync(freeImagePath);
    await blobClient.setRichMenuImage(freeMenuId.richMenuId, new Blob([imageData], { type: 'image/png' }));
    console.log('  画像アップロード完了');
  } else {
    console.log(`  ⚠️  画像ファイルが見つかりません: ${freeImagePath}`);
    console.log('     後で LINE Developers コンソールからアップロードしてください');
  }

  // Create paid member menu
  console.log('\n有料会員メニューを作成中...');
  const paidMenuId = await client.createRichMenu({
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
  });
  console.log(`  作成完了: ${paidMenuId.richMenuId}`);

  // Upload paid menu image if exists
  const paidImagePath = path.join(__dirname, 'rich-menu-paid.png');
  if (fs.existsSync(paidImagePath)) {
    const imageData = fs.readFileSync(paidImagePath);
    await blobClient.setRichMenuImage(paidMenuId.richMenuId, new Blob([imageData], { type: 'image/png' }));
    console.log('  画像アップロード完了');
  } else {
    console.log(`  ⚠️  画像ファイルが見つかりません: ${paidImagePath}`);
    console.log('     後で LINE Developers コンソールからアップロードしてください');
  }

  // Set free menu as default
  await client.setDefaultRichMenu(freeMenuId.richMenuId);
  console.log(`\nデフォルトメニュー設定: ${freeMenuId.richMenuId} (無料会員メニュー)`);

  console.log('\n=== セットアップ完了 ===');
  console.log('\n.env.local に以下を追加してください:');
  console.log(`RICH_MENU_FREE_ID=${freeMenuId.richMenuId}`);
  console.log(`RICH_MENU_PAID_ID=${paidMenuId.richMenuId}`);
}

main().catch(console.error);
