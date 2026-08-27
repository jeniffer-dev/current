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

  // No transaction is available through the Supabase client, so anything
  // that fails after this point takes the macrocycle down with it. A cycle
  // with no phases is worse than none at all: it covers a date range, so it
  // becomes "current" the moment today falls inside it, and every page
  // renders empty. Deleting the macrocycle cascades to phases and to their
  // prescriptions, so one delete undoes all of it.
  const rollback = async (message: string): Promise<CreateMacrocycleState> => {
    await supabase.from('macrocycles').delete().eq('id', created.id).eq('user_id', user.id);
    return { error: message };
  };

  const { data: insertedPhases, error: phasesError } = await supabase
    .from('phases')
    .insert(scheduled.map(phase => ({
      user_id:       user.id,
      macrocycle_id: created.id,
      name:          phase.name,
      phase_type:    phase.type,
      start_date:    phase.startDate,
      end_date:      phase.endDate,
      notes:         phase.description,
    })))
    .select('id, start_date');

  if (phasesError || !insertedPhases) {
    return rollback(phasesError?.message ?? 'Could not create the phases.');
  }

  // Matched on start_date rather than on the order rows came back in:
  // phases run back to back and every phase is at least a week long, so
  // within one macrocycle the start date identifies the phase.
  const phaseIdByStart = new Map(insertedPhases.map(p => [p.start_date, p.id]));

  const prescriptions: {
    user_id: string; phase_id: string; activity_key: string;
    label: string | null; sessions_per_week: number;
  }[] = [];

  const weekPrescriptions: {
    user_id: string; phase_id: string; week_index: number;
    activity_key: string; sessions_count: number;
  }[] = [];

  for (const [i, phase] of plan.phases.entries()) {
    const phaseId = phaseIdByStart.get(scheduled[i].startDate);
    if (!phaseId) return rollback('Could not match the phases that were created.');

    for (const session of phase.sessions) {
      prescriptions.push({
        user_id:           user.id,
        phase_id:          phaseId,
        activity_key:      session.key,
        label:             session.label,
        sessions_per_week: session.sessionsPerWeek,
      });
    }

    for (const override of phase.weekOverrides) {
      // A week past the end of the phase has no week to describe. The
      // builder prunes these, but the action is the boundary that decides.
      if (override.weekIndex >= phase.weeks) continue;
      for (const count of override.counts) {
        weekPrescriptions.push({
          user_id:        user.id,
          phase_id:       phaseId,
          week_index:     override.weekIndex,
          activity_key:   count.key,
          sessions_count: count.sessionsCount,
        });
      }
    }
  }

  if (prescriptions.length > 0) {
    const { error } = await supabase.from('phase_session_prescriptions').insert(prescriptions);
    if (error) return rollback(error.message);
  }

  if (weekPrescriptions.length > 0) {
    const { error } = await supabase.from('phase_week_prescriptions').insert(weekPrescriptions);
    if (error) return rollback(error.message);
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
