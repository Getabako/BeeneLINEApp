// ============================================
// Database Types
// ============================================

export type Membership = 'free' | 'paid';

export type FlowType =
  | 'idle'
  | 'skin_diagnosis'
  | 'health_diagnosis'
  | 'meal_analysis'
  | 'daily_report'
  | 'reservation'
  | 'faq'
  | 'consultation';

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export type BeforeAfterCategory = 'skin' | 'weight' | 'body';

export type AgeRange = '20s' | '30s' | '40s' | '50s' | '60s';

export interface User {
  id: string;
  line_user_id: string;
  display_name: string | null;
  membership: Membership;
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  registered_at: string;
  updated_at: string;
}

export interface ConversationState {
  id: string;
  line_user_id: string;
  current_flow: FlowType;
  step: number;
  context: Record<string, unknown>;
  updated_at: string;
}

export interface SkinLog {
  id: string;
  line_user_id: string;
  skin_age: number | null;
  moisture_score: number | null;
  spots_level: string | null;
  sagging_level: string | null;
  face_shape: string | null;
  overall_score: number | null;
  image_url: string | null;
  raw_analysis: Record<string, unknown> | null;
  created_at: string;
}

export interface MealLog {
  id: string;
  line_user_id: string;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  food_items: Record<string, unknown> | null;
  warmth_score: number | null;
  digestion_score: number | null;
  hydration_score: number | null;
  advice: string | null;
  meal_time: string | null;
  image_url: string | null;
  created_at: string;
}

export interface DailyReport {
  id: string;
  line_user_id: string;
  weight: number | null;
  sleep_hours: number | null;
  water_intake: number | null;
  bowel: string | null;
  mood: string | null;
  notes: string | null;
  created_at: string;
}

export interface BeforeAfter {
  id: string;
  category: BeforeAfterCategory;
  concern_type: string | null;
  age_range: AgeRange | null;
  before_description: string | null;
  after_description: string | null;
  improvement_data: Record<string, unknown> | null;
  image_url: string | null;
  created_at: string;
}

export interface Reservation {
  id: string;
  line_user_id: string;
  reservation_date: string;
  reservation_time: string;
  menu_type: string | null;
  status: ReservationStatus;
  created_at: string;
}

// ============================================
// AI Analysis Types
// ============================================

export interface SkinAnalysisResult {
  skin_age: number;
  moisture_score: number;
  spots_level: string;
  sagging_level: string;
  face_shape: string;
  overall_score: number;
  advice: string;
  details: string;
}

export interface MealAnalysisResult {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  food_items: string[];
  warmth_score: number;
  digestion_score: number;
  hydration_score: number;
  advice: string;
}

export interface HealthDiagnosisResult {
  bmi: number;
  bmi_category: string;
  ideal_weight: number;
  calorie_target: number;
  advice: string;
  obesity_level?: string;
  weight_diff?: number;
  comprehensive_analysis?: string;
  program_recommendation?: string;
}

export interface HealthComprehensiveResult {
  comprehensive_analysis: string;
  program_recommendation: string;
  advice: string;
}

// ============================================
// Handler Context Types
// ============================================

export interface SkinDiagnosisContext {
  awaiting_image?: boolean;
}

export interface HealthDiagnosisContext {
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  obesity_level?: string;
  ideal_weight?: number;
  weight_diff?: number;
  diet_history?: string;
  current_concerns?: string;
  program_question?: string;
}

export interface MealAnalysisContext {
  awaiting_image?: boolean;
}

export interface DailyReportContext {
  weight?: number;
  sleep_hours?: number;
  water_intake?: number;
  bowel?: string;
  mood?: string;
}

export interface ReservationContext {
  date?: string;
  time?: string;
  menu_type?: string;
}
