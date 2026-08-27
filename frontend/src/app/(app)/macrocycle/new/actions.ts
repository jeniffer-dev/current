'use server';

import { revalidatePath } from 'next/cache';
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

  const { data: created, error: insertError } = await supabase
    .from('macrocycles')
    .insert({
      user_id:         user.id,
      name:            plan.name,
      goal_event:      plan.goalEvent,
      goal_event_date: plan.targetDate,
      start_date:      plan.startDate,
      end_date:        endDate,
    })
    .select('id')
    .single();

  if (insertError || !created) {
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

  // No transaction is available through the Supabase client, so the
  // macrocycle is removed by hand if its phases fail to land. A cycle with
  // no phases is worse than none at all: it covers a date range, so it
  // becomes "current" the moment today falls inside it, and every page
  // renders empty.
  if (phasesError) {
    await supabase.from('macrocycles').delete().eq('id', created.id).eq('user_id', user.id);
    return { error: phasesError.message };
  }

  revalidatePath('/macrocycle');
  revalidatePath('/dashboard');
  revalidatePath('/planner');
  revalidatePath('/performance');
  revalidatePath('/tests');

  // Navigation is left to the caller. redirect() throws a control-flow
  // exception that has to travel back through the action boundary, and when
  // it does not, the client transition never settles and the button sits on
  // "Creating…" forever while the plan has in fact been created.
  return { error: null };
}
