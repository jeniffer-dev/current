'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createMacrocycleSchema, firstIssueMessage } from '@/lib/validation';
import { planEndDate, schedulePhases } from '@/lib/phase-plan';
import type { CreateMacrocycleInput } from '@/lib/validation';

export type CreateMacrocycleState = { error: string | null };

export async function createMacrocycle(
  input: CreateMacrocycleInput,
): Promise<CreateMacrocycleState> {
  const parsed = createMacrocycleSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed) };
  const plan = parsed.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  // The macrocycle runs for as long as its phases do, which is not
  // necessarily up to the event — the builder reports that gap rather than
  // silently stretching the last phase to close it.
  const endDate = planEndDate(plan.startDate, plan.phases);

  // Remembered before anything changes, so a later failure can put the
  // athlete's existing plan back the way it was.
  const { data: previous } = await supabase
    .from('macrocycles')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  // At most one active macrocycle per athlete (partial unique index), so
  // the previous one has to step down before the new one is inserted.
  const { error: archiveError } = await supabase
    .from('macrocycles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('is_active', true);

  if (archiveError) return { error: archiveError.message };

  const restorePrevious = async () => {
    if (!previous?.id) return;
    await supabase
      .from('macrocycles')
      .update({ is_active: true })
      .eq('id', previous.id)
      .eq('user_id', user.id);
  };

  const { data: created, error: insertError } = await supabase
    .from('macrocycles')
    .insert({
      user_id:    user.id,
      name:       plan.name,
      goal_event: plan.goalEvent,
      start_date: plan.startDate,
      end_date:   endDate,
      is_active:  true,
    })
    .select('id')
    .single();

  if (insertError || !created) {
    await restorePrevious();
    return { error: insertError?.message ?? 'Could not create the plan.' };
  }

  const scheduled = schedulePhases(plan.startDate, plan.phases);

  const { error: phasesError } = await supabase.from('phases').insert(
    scheduled.map(phase => ({
      user_id:       user.id,
      macrocycle_id: created.id,
      name:          phase.name,
      phase_type:    phase.type,
      start_date:    phase.startDate,
      end_date:      phase.endDate,
      notes:         phase.description,
    })),
  );

  // No transaction is available through the Supabase client. Without this
  // rollback a failure here leaves an active macrocycle with no phases,
  // which is worse than no macrocycle at all — it shadows the previous one
  // and every page renders empty.
  if (phasesError) {
    await supabase.from('macrocycles').delete().eq('id', created.id).eq('user_id', user.id);
    await restorePrevious();
    return { error: phasesError.message };
  }

  revalidatePath('/macrocycle');
  revalidatePath('/dashboard');
  revalidatePath('/planner');
  revalidatePath('/performance');
  revalidatePath('/tests');

  redirect('/macrocycle');
}
