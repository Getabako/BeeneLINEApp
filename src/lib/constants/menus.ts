export const MENU_TYPES = [
  { label: 'フェイシャルエステ', value: 'facial' },
  { label: 'ボディケア', value: 'body_care' },
  { label: '小顔矯正', value: 'face_correction' },
  { label: 'デトックスケア', value: 'detox' },
  { label: 'カウンセリング', value: 'counseling' },
] as const;

export const BOWEL_OPTIONS = [
  { label: '快調', value: 'good' },
  { label: '普通', value: 'normal' },
  { label: '便秘気味', value: 'constipation' },
  { label: '下痢気味', value: 'diarrhea' },
] as const;

export const MOOD_OPTIONS = [
  { label: '😊 とても良い', value: 'very_good' },
  { label: '🙂 良い', value: 'good' },
  { label: '😐 普通', value: 'normal' },
  { label: '😔 あまり良くない', value: 'bad' },
  { label: '😢 悪い', value: 'very_bad' },
] as const;

export const GENDER_OPTIONS = [
  { label: '女性', value: 'female' },
  { label: '男性', value: 'male' },
  { label: 'その他', value: 'other' },
] as const;

// 予約店舗一覧
export const STORES = [
  {
    name: 'はりサロンHALicht横手',
    description: '横手市・美容鍼サロン',
    url: 'https://beauty.hotpepper.jp/CSP/kr/reserve/?storeId=H000665764&ch=1&vos=cpshbkprocap0140516003',
    image: 'https://beene-akita.jp/wp-content/uploads/2023/01/akita-store.jpg',
  },
  {
    name: 'Beene秋田店',
    description: '秋田駅徒歩8分・美容鍼サロン',
    url: 'https://beauty.hotpepper.jp/kr/slnH000676700/coupon/',
    image: 'https://beene-akita.jp/wp-content/uploads/2023/01/store2.jpg',
  },
  {
    name: 'Beene札幌琴似店',
    description: '札幌琴似・美容鍼サロン',
    url: 'https://beauty.hotpepper.jp/kr/slnH000766334/',
    image: 'https://beene-akita.jp/wp-content/uploads/2023/01/store3.jpg',
  },
] as const;

// FAQ カテゴリ
export const FAQ_CATEGORIES = [
  { label: '施術について', data: 'faq_cat=treatment' },
  { label: '料金・プラン', data: 'faq_cat=pricing' },
  { label: '予約・来店', data: 'faq_cat=visit' },
  { label: '効果・回数', data: 'faq_cat=effect' },
] as const;

export const FAQ_ITEMS: Record<string, { question: string; answer: string }[]> = {
  treatment: [
    {
      question: '美容鍼は痛いですか？',
      answer: '髪の毛より細い極細鍼を使用しているため、ほとんど痛みを感じません。初めての方でも安心して受けていただけます。',
    },
    {
      question: 'ダウンタイムはありますか？',
      answer: 'ダウンタイムはほぼありません。施術後すぐにメイクも可能です。まれに内出血が出る場合がありますが、数日で消えます。',
    },
    {
      question: 'どんな施術がありますか？',
      answer: '肌育・小顔美容鍼premium（EXO美容鍼）、肌育美容鍼・小顔美容鍼、鍼灸ダイエットなどをご用意しています。小顔マッサージやアロマ付きヘッドスパもございます。',
    },
    {
      question: '男性でも受けられますか？',
      answer: 'はい、男性のお客様も多数ご来店いただいております。お気軽にご予約ください。',
    },
  ],
  pricing: [
    {
      question: '料金はいくらですか？',
      answer: 'メニューにより異なります。詳しくはホットペッパーの各店舗ページでクーポンや料金をご確認いただけます。初回限定のお得なクーポンもご用意しています！',
    },
    {
      question: '追加料金はかかりますか？',
      answer: '表示価格以外の追加料金は一切かかりません。商品の無理な押し売りも行っておりませんのでご安心ください。',
    },
    {
      question: '有料会員のメリットは？',
      answer: '有料会員になると、AI食事解析、ダイエット日報、経過グラフなどの機能がご利用いただけます。詳しくはスタッフにお問い合わせください。',
    },
  ],
  visit: [
    {
      question: '予約は必要ですか？',
      answer: '完全予約制となっております。ホットペッパーまたはLINEからご予約ください。',
    },
    {
      question: '持ち物はありますか？',
      answer: '特にございません。メイク直し用品をお持ちいただくと便利です。',
    },
    {
      question: '営業時間を教えてください',
      answer: '10:00〜19:00（不定休）です。秋田駅から徒歩8分の場所にございます。',
    },
  ],
  effect: [
    {
      question: '何回で効果が出ますか？',
      answer: '個人差はありますが、1回目から「顔が引き締まった」と実感される方が多いです。継続的な効果を得るには、最初は週1回、その後は2〜4週に1回のペースがおすすめです。',
    },
    {
      question: 'ニキビにも効果がありますか？',
      answer: 'はい、美容鍼はニキビ・肌荒れの改善にも効果が期待できます。血行促進やターンオーバーの正常化を促します。',
    },
    {
      question: 'ダイエット効果はありますか？',
      answer: '鍼灸ダイエットコースでは、体質改善を通じて無理のない体型改善をサポートします。食事指導と組み合わせることでより効果的です。',
    },
  ],
};

// 相談カテゴリ
export const CONSULTATION_CATEGORIES = [
  { label: '肌のお悩み', data: 'consult_cat=skin' },
  { label: '体型・ダイエット', data: 'consult_cat=diet' },
  { label: '体の不調', data: 'consult_cat=health' },
  { label: 'その他', data: 'consult_cat=other' },
] as const;

export const CONSULTATION_ITEMS: Record<string, { question: string; data: string }[]> = {
  skin: [
    { question: 'シミ・くすみが気になる', data: 'consult_q=spots' },
    { question: 'たるみ・ほうれい線が気になる', data: 'consult_q=sagging' },
    { question: 'ニキビ・肌荒れが治らない', data: 'consult_q=acne' },
    { question: '乾燥・かさつきが気になる', data: 'consult_q=dry' },
  ],
  diet: [
    { question: '体重が落ちない', data: 'consult_q=weight' },
    { question: '食事管理が難しい', data: 'consult_q=meal_manage' },
    { question: 'リバウンドを繰り返す', data: 'consult_q=rebound' },
    { question: '部分痩せしたい', data: 'consult_q=partial' },
  ],
  health: [
    { question: '冷え性がつらい', data: 'consult_q=cold' },
    { question: '睡眠の質が悪い', data: 'consult_q=sleep' },
    { question: '肩こり・頭痛がひどい', data: 'consult_q=stiff' },
    { question: '疲れが取れない', data: 'consult_q=fatigue' },
  ],
  other: [
    { question: '美容鍼に興味がある', data: 'consult_q=interest' },
    { question: '初めてで不安', data: 'consult_q=first_time' },
    { question: 'どのメニューが合うかわからない', data: 'consult_q=recommend' },
  ],
};

// 体重診断: 悩み選択肢
export const HEALTH_CONCERN_OPTIONS = [
  { label: '食事制限が続かない', value: 'diet_hard' },
  { label: 'リバウンドを繰り返す', value: 'rebound' },
  { label: '運動が苦手', value: 'exercise_hard' },
  { label: '体質的に痩せにくい', value: 'hard_to_lose' },
] as const;

// 体重診断: プログラムで知りたいこと選択肢
export const HEALTH_PROGRAM_OPTIONS = [
  { label: 'プログラムの内容', value: 'program_detail' },
  { label: '期間と費用', value: 'duration_cost' },
  { label: '成功事例が知りたい', value: 'success_cases' },
  { label: 'まず相談したい', value: 'want_consult' },
] as const;

// リッチメニュー定義
export const RICH_MENU = {
  DEFAULT: {
    name: 'BeeneStyle メニュー',
    areas: [
      { action: 'skin_diagnosis', label: '肌診断' },
      { action: 'health_diagnosis', label: '体重診断' },
      { action: 'faq', label: 'FAQ' },
      { action: 'meal_analysis', label: '食事記録' },
      { action: 'daily_report', label: '日報' },
      { action: 'consultation', label: '相談' },
    ],
  },
} as const;
