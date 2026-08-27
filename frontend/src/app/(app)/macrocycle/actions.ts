'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { firstIssueMessage } from '@/lib/validation';

const activateSchema = z.object({ macrocycleId: z.string().uuid() });

export type ActivateState = { error: string | null };

/**
 * Brings an archived macrocycle back as the current one.
 *
 * Creating a plan archives the previous one, and every page reads the
 * active plan — so without this, archiving is a one-way door and the
 * earlier cycle is only reachable through SQL.
 */
export async function activateMacrocycle(macrocycleId: string): Promise<ActivateState> {
  const parsed = activateSchema.safeParse({ macrocycleId });
  if (!parsed.success) return { error: firstIssueMessage(parsed) };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  // Confirm it is this athlete's plan before touching anything. RLS would
  // refuse the write anyway, but failing here gives an honest message
  // instead of a silent no-op.
  const { data: target } = await supabase
    .from('macrocycles')
    .select('id, is_active')
    .eq('id', macrocycleId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!target) return { error: 'That plan no longer exists.' };
  if (target.is_active) return { error: null };

  // Only one active plan per athlete (partial unique index), so the
  // current one steps down first.
  const { error: archiveError } = await supabase
    .from('macrocycles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('is_active', true);

  if (archiveError) return { error: archiveError.message };

  const { error: activateError } = await supabase
    .from('macrocycles')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', macrocycleId)
    .eq('user_id', user.id);

  if (activateError) return { error: activateError.message };

  revalidatePath('/macrocycle');
  revalidatePath('/dashboard');
  revalidatePath('/planner');
  revalidatePath('/performance');
  revalidatePath('/tests');

  return { error: null };
}
