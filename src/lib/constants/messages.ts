export const MESSAGES = {
  // 挨拶
  WELCOME: `BeeneStyleへようこそ！🌿
あなたの美容と健康をAIがサポートします。

画面下のメニューからお好きな機能をお試しください✨`,

  // 肌診断
  SKIN_DIAGNOSIS_START: `AI肌診断を開始します✨
お顔の正面写真を1枚送ってください。

📸 撮影のコツ:
・明るい場所で撮影
・正面を向いて
・メイクなしがベスト`,

  SKIN_DIAGNOSIS_ANALYZING: '写真を受け取りました！AIが分析中です...🔍',
  SKIN_DIAGNOSIS_ERROR: '申し訳ございません。画像の分析に失敗しました。もう一度お顔の写真を送ってください。',

  // 体重診断（カウンセリング申込フロー）
  HEALTH_ASK_HEIGHT: 'ダイエットカウンセリングを始めます💪\n\nまず、身長を教えてください（cm）\n\n例: 165',
  HEALTH_ASK_WEIGHT: '体重を教えてください（kg）\n\n例: 58.5',
  HEALTH_ASK_DIET_HISTORY: 'これまでのダイエット経験を教えてください📝\n\n（例: 糖質制限を3ヶ月、ジム通い半年など。なければ「なし」）',
  HEALTH_ASK_CONCERNS: '現在のお悩みで一番近いものを選んでください🤔',
  HEALTH_ASK_PROGRAM: 'プログラムについて知りたいことを選んでください✨',
  HEALTH_ANALYZING: 'あなたに最適なプランをAIが分析中です...📊',
  HEALTH_COUNSELING_CTA: `無料カウンセリングで、あなただけのプログラムを詳しくご提案します✨\n\nぜひお気軽にご予約ください！`,
  HEALTH_INVALID_NUMBER: '数字で入力してください。',

  // 食事解析
  MEAL_START: `食事記録を開始します🍽️
食事の写真を送ってください。

AIが栄養バランスと東洋医学的な観点から分析します。`,

  MEAL_ANALYZING: '食事写真を受け取りました！AIが分析中です...🍳',
  MEAL_ERROR: '申し訳ございません。食事の分析に失敗しました。もう一度写真を送ってください。',

  // 日報
  DAILY_REPORT_START: '今日の日報を記録しましょう📝\n\nまず、今朝の体重を教えてください（kg）\n\n例: 58.5',
  DAILY_ASK_SLEEP: '睡眠時間を教えてください（時間）\n\n例: 7.5',
  DAILY_ASK_WATER: '水分摂取量を教えてください（L）\n\n例: 1.5',
  DAILY_ASK_BOWEL: '排便状況を教えてください',
  DAILY_ASK_MOOD: '今日の気分を教えてください',
  DAILY_ASK_NOTES: 'メモがあれば入力してください（なければ「なし」と入力）',
  DAILY_SAVED: '日報を記録しました！お疲れ様です✨\n\n継続は力なりです。明日も頑張りましょう！',

  // 予約
  RESERVATION_PROMPT: '気になる店舗がございましたら、以下からご予約いただけます📅',

  // FAQ
  FAQ_START: 'Beeneについてのご質問ですね💬\n\n気になるカテゴリを選んでください！\n\n自由に質問を入力してもOKです✨',

  // 相談
  CONSULTATION_START: '美容・健康のご相談ですね✨\n\n気になるお悩みを選んでください！\n\n自由に入力してもOKです💬',

  // 画像受信（idle状態）
  IMAGE_ASK_PURPOSE: '画像を受け取りました📷\n\nこの画像は何の分析に使いますか？',

  // エラー
  GENERAL_ERROR: '申し訳ございません。エラーが発生しました。もう一度お試しください。',

  // フロー切替
  FLOW_SWITCHED: '前の操作をキャンセルしました。',
} as const;
