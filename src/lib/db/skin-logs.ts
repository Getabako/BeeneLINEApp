import { supabase } from './client';
import type { SkinLog, SkinAnalysisResult } from '@/types';

export async function saveSkinLog(
  lineUserId: string,
  result: SkinAnalysisResult,
  imageUrl?: string
): Promise<SkinLog> {
  const { data, error } = await supabase
    .from('skin_logs')
    .insert({
      line_user_id: lineUserId,
      skin_age: result.skin_age,
      moisture_score: result.moisture_score,
      spots_level: result.spots_level,
      sagging_level: result.sagging_level,
      face_shape: result.face_shape,
      overall_score: result.overall_score,
      image_url: imageUrl ?? null,
      raw_analysis: result as unknown as Record<string, unknown>,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save skin log: ${error.message}`);
  return data as SkinLog;
}

export async function getSkinLogs(lineUserId: string, limit = 10): Promise<SkinLog[]> {
  const { data, error } = await supabase
    .from('skin_logs')
    .select('*')
    .eq('line_user_id', lineUserId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to get skin logs: ${error.message}`);
  return (data ?? []) as SkinLog[];
}
