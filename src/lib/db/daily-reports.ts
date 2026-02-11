import { supabase } from './client';
import type { DailyReport } from '@/types';

export async function saveDailyReport(
  lineUserId: string,
  report: {
    weight?: number;
    sleep_hours?: number;
    water_intake?: number;
    bowel?: string;
    mood?: string;
    notes?: string;
  }
): Promise<DailyReport> {
  const { data, error } = await supabase
    .from('daily_reports')
    .insert({
      line_user_id: lineUserId,
      ...report,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save daily report: ${error.message}`);
  return data as DailyReport;
}

export async function getDailyReports(lineUserId: string, limit = 30): Promise<DailyReport[]> {
  const { data, error } = await supabase
    .from('daily_reports')
    .select('*')
    .eq('line_user_id', lineUserId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to get daily reports: ${error.message}`);
  return (data ?? []) as DailyReport[];
}
