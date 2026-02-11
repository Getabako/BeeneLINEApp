import { supabase } from '@/lib/db/client';
import type { ConversationState, FlowType } from '@/types';

export async function getState(lineUserId: string): Promise<ConversationState> {
  const { data } = await supabase
    .from('conversation_states')
    .select('*')
    .eq('line_user_id', lineUserId)
    .single();

  if (data) return data as ConversationState;

  // Create initial state
  const { data: created, error } = await supabase
    .from('conversation_states')
    .insert({
      line_user_id: lineUserId,
      current_flow: 'idle',
      step: 0,
      context: {},
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create state: ${error.message}`);
  return created as ConversationState;
}

export async function setState(
  lineUserId: string,
  flow: FlowType,
  step: number,
  context: Record<string, unknown> = {}
): Promise<void> {
  const { error } = await supabase
    .from('conversation_states')
    .update({
      current_flow: flow,
      step,
      context,
    })
    .eq('line_user_id', lineUserId);

  if (error) throw new Error(`Failed to update state: ${error.message}`);
}

export async function resetState(lineUserId: string): Promise<void> {
  await setState(lineUserId, 'idle', 0, {});
}

export async function updateContext(
  lineUserId: string,
  contextUpdates: Record<string, unknown>
): Promise<void> {
  const state = await getState(lineUserId);
  const merged = { ...state.context, ...contextUpdates };

  const { error } = await supabase
    .from('conversation_states')
    .update({ context: merged })
    .eq('line_user_id', lineUserId);

  if (error) throw new Error(`Failed to update context: ${error.message}`);
}
