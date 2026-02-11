export const MESSAGES = {
  // 挨拶
  WELCOME: `BeeneStyleへようこそ！🌿
あなたの美容と健康をAIがサポートします。

下のメニューからお試しください：
・🔍 肌診断 - お顔の写真で肌分析
・⚖️ 体重診断 - BMI・理想体重チェック
・❓ FAQ - よくある質問`,

  // 肌診断
  SKIN_DIAGNOSIS_START: `AI肌診断を開始します✨
お顔の正面写真を1枚送ってください。

📸 撮影のコツ:
・明るい場所で撮影
・正面を向いて
・メイクなしがベスト`,

  SKIN_DIAGNOSIS_ANALYZING: '写真を受け取りました！AIが分析中です...🔍',

  SKIN_DIAGNOSIS_ERROR: '申し訳ございません。画像の分析に失敗しました。もう一度お顔の写真を送ってください。',

  // 健康診断
  HEALTH_ASK_AGE: '健康体重診断を始めます💪\nまず、年齢を教えてください（数字のみ）',
  HEALTH_ASK_GENDER: '性別を教えてください',
  HEALTH_ASK_HEIGHT: '身長を教えてください（cm）\n例: 165',
  HEALTH_ASK_WEIGHT: '体重を教えてください（kg）\n例: 58.5',
  HEALTH_ANALYZING: '情報をありがとうございます！AIが分析中です...📊',
  HEALTH_INVALID_NUMBER: '数字で入力してください。',

  // 食事解析
  MEAL_START: `食事記録を開始します🍽️
食事の写真を送ってください。

AIが栄養バランスと東洋医学的な観点から分析します。`,

  MEAL_ANALYZING: '食事写真を受け取りました！AIが分析中です...🍳',
  MEAL_ERROR: '申し訳ございません。食事の分析に失敗しました。もう一度写真を送ってください。',
  MEAL_PAID_ONLY: 'この機能は有料会員限定です。\n詳しくはスタッフにお問い合わせください。',

  // 日報
  DAILY_REPORT_START: '今日の日報を記録しましょう📝\nまず、今朝の体重を教えてください（kg）\n例: 58.5',
  DAILY_ASK_SLEEP: '睡眠時間を教えてください（時間）\n例: 7.5',
  DAILY_ASK_WATER: '水分摂取量を教えてください（L）\n例: 1.5',
  DAILY_ASK_BOWEL: '排便状況を教えてください',
  DAILY_ASK_MOOD: '今日の気分を教えてください',
  DAILY_ASK_NOTES: 'メモがあれば入力してください（なければ「なし」と入力）',
  DAILY_SAVED: '日報を記録しました！お疲れ様です✨\n継続は力なりです。明日も頑張りましょう！',
  DAILY_PAID_ONLY: 'この機能は有料会員限定です。\n詳しくはスタッフにお問い合わせください。',

  // 予約
  RESERVATION_START: '予約を承ります📅\nご希望の日付を教えてください\n例: 2025-03-15',
  RESERVATION_ASK_TIME: 'ご希望の時間を教えてください\n例: 14:00',
  RESERVATION_ASK_MENU: '施術メニューを選択してください',
  RESERVATION_CONFIRMED: 'ご予約を承りました！\n確認のメッセージを後ほどお送りします。',
  RESERVATION_INVALID_DATE: '正しい日付形式で入力してください（例: 2025-03-15）',
  RESERVATION_INVALID_TIME: '正しい時間形式で入力してください（例: 14:00）',

  // FAQ
  FAQ_START: 'ご質問をどうぞ！BeeneStyleのサービスについてお答えします💬',

  // 画像受信（idle状態）
  IMAGE_ASK_PURPOSE: '画像を受け取りました📷\nこの画像は何の分析に使いますか？',

  // エラー
  GENERAL_ERROR: '申し訳ございません。エラーが発生しました。もう一度お試しください。',

  // 問い合わせ
  CONTACT: `お問い合わせありがとうございます。
スタッフが確認次第ご連絡いたします。

お急ぎの方はお電話ください：
📞 03-XXXX-XXXX（平日10:00-18:00）`,
} as const;
