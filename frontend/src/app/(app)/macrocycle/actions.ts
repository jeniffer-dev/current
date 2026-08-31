'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { firstIssueMessage } from '@/lib/validation';

const planId = z.object({ id: z.string().uuid() });

export type PlanActionState = { error: string | null };

function revalidateEverywhere() {
  // A cycle decides what every page reads, so all of them are stale.
  for (const path of ['/macrocycle', '/dashboard', '/planner', '/performance', '/tests']) {
    revalidatePath(path);
  }
}

/**
 * Sets a cycle aside. It keeps its phases, its training and its results,
 * and stops competing to be the one you are in.
 *
 * This is the safe half of the pair: nothing is destroyed, so it needs no
 * guard beyond ownership.
 */
export async function archiveMacrocycle(input: { id: string }): Promise<PlanActionState> {
  const parsed = planId.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed) };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { error } = await supabase
    .from('macrocycles')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', parsed.data.id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidateEverywhere();
  return { error: null };
}

/** Brings an archived cycle back. Refused if it would overlap a live one. */
export async function unarchiveMacrocycle(input: { id: string }): Promise<PlanActionState> {
  const parsed = planId.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed) };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { error } = await supabase
    .from('macrocycles')
    .update({ archived_at: null })
    .eq('id', parsed.data.id)
    .eq('user_id', user.id);

  // The exclusion constraint speaks in Postgres. Say it in the athlete's
  // terms instead: the reason it refused is that the dates are taken.
  if (error?.code === '23P01' || error?.message.includes('macrocycles_no_overlap')) {
    return { error: 'Those dates already belong to another plan. Archive that one first.' };
  }
  if (error) return { error: error.message };
  revalidateEverywhere();
  return { error: null };
}

/**
 * Deletes a cycle outright — only ever the ones nobody trained in.
 *
 * The real protection is a trigger in the database, not this function:
 * training_days cascades from macrocycles, and sessions and logged sets
 * cascade from there, so a delete of a trained cycle would quietly take a
 * season with it. Counting here first only buys a better message.
 */
export async function deleteMacrocycle(input: { id: string }): Promise<PlanActionState> {
  const parsed = planId.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed) };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { error } = await supabase
    .from('macrocycles')
    .delete()
    .eq('id', parsed.data.id)
    .eq('user_id', user.id);

  if (error) {
    // The trigger raises restrict_violation with a message naming what
    // stands in the way. It is already the right thing to show.
    if (error.code === '23001' || error.message.includes('Archive it instead')) {
      return { error: 'This plan has training behind it. Archive it instead of deleting it.' };
    }
    return { error: error.message };
  }

  revalidateEverywhere();
  return { error: null };
}
