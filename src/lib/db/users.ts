import { supabase } from './client';
import type { User } from '@/types';

export async function getOrCreateUser(lineUserId: string, displayName?: string): Promise<User> {
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('line_user_id', lineUserId)
    .single();

  if (existing) return existing as User;

  const { data: created, error } = await supabase
    .from('users')
    .insert({
      line_user_id: lineUserId,
      display_name: displayName ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create user: ${error.message}`);
  return created as User;
}

export async function updateUser(lineUserId: string, updates: Partial<User>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('line_user_id', lineUserId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update user: ${error.message}`);
  return data as User;
}

export async function getUserByLineId(lineUserId: string): Promise<User | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('line_user_id', lineUserId)
    .single();

  return data as User | null;
}
