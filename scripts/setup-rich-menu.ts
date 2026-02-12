/**
 * リッチメニューセットアップスクリプト
 *
 * 使い方:
 *   npx tsx scripts/setup-rich-menu.ts
 *
 * 事前準備:
 *   1. .env.local に LINE_CHANNEL_ACCESS_TOKEN を設定
 *   2. リッチメニュー画像を用意 (2500x1686px)
 *      - scripts/rich-menu.png
 *
 * メニュー配置 (6パネル):
 * ┌──────────┬──────────┬──────────┐
 * │  肌診断   │ 体重診断  │   FAQ    │
 * ├──────────┼──────────┼──────────┤
 * │  食事記録  │   日報   │   相談   │
 * └──────────┴──────────┴──────────┘
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

function createArea(col: number, row: number, action: string, label: string) {
  const x = col * cellWidth;
  const y = row * cellHeight;

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

  // Create 6-panel menu
  console.log('\nリッチメニューを作成中...');
  const menuId = await client.createRichMenu({
    size: { width: MENU_WIDTH, height: MENU_HEIGHT },
    selected: true,
    name: 'BeeneStyle メニュー',
    chatBarText: 'メニューを開く',
    areas: [
      // Row 1: 肌診断 | 体重診断 | FAQ
      createArea(0, 0, 'skin_diagnosis', '肌診断'),
      createArea(1, 0, 'health_diagnosis', '体重診断'),
      createArea(2, 0, 'faq', 'FAQ'),
      // Row 2: 食事記録 | 日報 | 相談
      createArea(0, 1, 'meal_analysis', '食事記録'),
      createArea(1, 1, 'daily_report', '日報'),
      createArea(2, 1, 'consultation', '相談'),
    ],
  });
  console.log(`  作成完了: ${menuId.richMenuId}`);

  // Upload menu image if exists
  const imagePath = path.join(__dirname, 'rich-menu.png');
  if (fs.existsSync(imagePath)) {
    const imageData = fs.readFileSync(imagePath);
    await blobClient.setRichMenuImage(menuId.richMenuId, new Blob([imageData], { type: 'image/png' }));
    console.log('  画像アップロード完了');
  } else {
    console.log(`  ⚠️  画像ファイルが見つかりません: ${imagePath}`);
    console.log('     後で LINE Developers コンソールからアップロードしてください');
  }

  // Set as default
  await client.setDefaultRichMenu(menuId.richMenuId);
  console.log(`\nデフォルトメニュー設定: ${menuId.richMenuId}`);

  console.log('\n=== セットアップ完了 ===');
  console.log(`\nリッチメニューID: ${menuId.richMenuId}`);
  console.log('\n※ 画像がまだの場合は LINE Developers コンソールから');
  console.log('  2500x1686px の画像をアップロードしてください。');
  console.log('\nメニュー配置:');
  console.log('┌──────────┬──────────┬──────────┐');
  console.log('│  肌診断   │ 体重診断  │   FAQ    │');
  console.log('├──────────┼──────────┼──────────┤');
  console.log('│  食事記録  │   日報   │   相談   │');
  console.log('└──────────┴──────────┴──────────┘');
}

main().catch(console.error);
