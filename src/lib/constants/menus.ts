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

export const RICH_MENU = {
  FREE: {
    name: 'BeeneStyle 無料会員メニュー',
    areas: [
      { action: 'skin_diagnosis', label: '肌診断' },
      { action: 'health_diagnosis', label: '体重診断' },
      { action: 'faq', label: 'FAQ' },
      { action: 'reservation', label: '予約' },
      { action: 'column', label: 'コラム', type: 'uri' as const },
      { action: 'contact', label: 'お問合せ' },
    ],
  },
  PAID: {
    name: 'BeeneStyle 有料会員メニュー',
    areas: [
      { action: 'meal_analysis', label: '食事記録' },
      { action: 'daily_report', label: '日報' },
      { action: 'skin_diagnosis', label: '肌診断' },
      { action: 'reservation', label: '予約' },
      { action: 'progress', label: '経過' },
      { action: 'consultation', label: '相談' },
    ],
  },
} as const;
