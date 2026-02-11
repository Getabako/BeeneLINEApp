import { supabase } from './client';
import type { BeforeAfter, BeforeAfterCategory, AgeRange } from '@/types';

export async function getBeforeAfterByCategory(
  category: BeforeAfterCategory,
  concernType?: string,
  ageRange?: AgeRange
): Promise<BeforeAfter[]> {
  let query = supabase
    .from('before_after')
    .select('*')
    .eq('category', category);

  if (concernType) {
    query = query.eq('concern_type', concernType);
  }
  if (ageRange) {
    query = query.eq('age_range', ageRange);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to get before/after data: ${error.message}`);
  return (data ?? []) as BeforeAfter[];
}
