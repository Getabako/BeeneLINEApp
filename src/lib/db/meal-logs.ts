import { supabase } from './client';
import type { MealLog, MealAnalysisResult } from '@/types';

export async function saveMealLog(
  lineUserId: string,
  result: MealAnalysisResult,
  imageUrl?: string
): Promise<MealLog> {
  const { data, error } = await supabase
    .from('meal_logs')
    .insert({
      line_user_id: lineUserId,
      calories: result.calories,
      protein: result.protein,
      fat: result.fat,
      carbs: result.carbs,
      food_items: result.food_items,
      warmth_score: result.warmth_score,
      digestion_score: result.digestion_score,
      hydration_score: result.hydration_score,
      advice: result.advice,
      meal_time: new Date().toISOString(),
      image_url: imageUrl ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save meal log: ${error.message}`);
  return data as MealLog;
}

export async function getMealLogs(lineUserId: string, limit = 10): Promise<MealLog[]> {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('line_user_id', lineUserId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to get meal logs: ${error.message}`);
  return (data ?? []) as MealLog[];
}
