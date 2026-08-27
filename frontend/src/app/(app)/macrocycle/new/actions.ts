'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createMacrocycleSchema, firstIssueMessage } from '@/lib/validation';
import { planEndDate, schedulePhases } from '@/lib/phase-plan';
import { scheduleBatteries, type Anchor, type Battery, type SchedulePhase } from '@/lib/test-schedule';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateMacrocycleInput } from '@/lib/validation';

export type CreateMacrocycleState = { error: string | null };

/**
 * Writes the schedule the batteries imply: one testing_block per week that
 * has testing in it, one testing_session per battery landing that week, and
 * the tests each session prescribes.
 *
 * Returns an error message, or null. The caller rolls the whole macrocycle
 * back on a message — there are no transactions through this client, and a
 * half-written testing calendar is worse than none.
 */
async function materialiseSchedule(
  supabase:        SupabaseClient,
  userId:          string,
  macrocycleId:    string,
  macrocycleStart: string,
  batteries:       Battery[],
  phases:          SchedulePhase[],
): Promise<string | null> {
  const blocks = scheduleBatteries(macrocycleStart, batteries, phases);
  if (blocks.length === 0) return null;

  const { data: createdBlocks, error: blockError } = await supabase
    .from('testing_blocks')
    .insert(blocks.map(b => ({
      user_id:        userId,
      macrocycle_id:  macrocycleId,
      week_number:    b.weekNumber,
      scheduled_date: b.date,
      purpose:        b.purpose,
      status:         'upcoming',
    })))
    .select('id, week_number');

  if (blockError || !createdBlocks) {
    return blockError?.message ?? 'Could not schedule the testing blocks.';
  }

  const blockIdByWeek = new Map(createdBlocks.map(b => [b.week_number, b.id]));

  const sessionRows = blocks.flatMap(block =>
    block.sessions.flatMap(session => {
      const blockId = blockIdByWeek.get(block.weekNumber);
      return blockId ? [{
        user_id:          userId,
        testing_block_id: blockId,
        battery_id:       session.batteryId,
        date:             session.date,
        session_type:     session.sessionType,
        session_label:    session.label,
        status:           'upcoming',
      }] : [];
    }));

  if (sessionRows.length === 0) return null;

  const { data: createdSessions, error: sessionError } = await supabase
    .from('testing_sessions')
    .insert(sessionRows)
    .select('id, battery_id, testing_block_id');

  if (sessionError || !createdSessions) {
    return sessionError?.message ?? 'Could not schedule the testing sessions.';
  }

  // Which tests each generated session prescribes. Without this a session
  // that has not been performed yet lists nothing at all.
  const templatesByBattery = new Map(batteries.map(b => [b.id, b.templateIds]));
  const itemRows = createdSessions.flatMap(session =>
    (templatesByBattery.get(session.battery_id) ?? []).map((templateId, order) => ({
      user_id:            userId,
      testing_session_id: session.id,
      test_template_id:   templateId,
      order_index:        order,
    })));

  if (itemRows.length > 0) {
    const { error } = await supabase.from('testing_session_items').insert(itemRows);
    if (error) return error.message;
  }

  return null;
}

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

  // ── testing ───────────────────────────────────────────────────

  if (plan.batteries.length > 0) {
    // Inserted one at a time, not as a batch. A battery's id has to be
    // matched back to the anchors and tests the athlete attached to it,
    // and a batch insert offers no dependable way to do that: the rows
    // share a created_at to the microsecond, and two batteries may carry
    // the same name. There are two or three of these, so the extra round
    // trips cost nothing worth a guess.
    const createdBatteries: { id: string }[] = [];
    for (const battery of plan.batteries) {
      const { data, error } = await supabase
        .from('test_batteries')
        .insert({
          user_id:       user.id,
          macrocycle_id: created.id,
          name:          battery.name,
          kind:          battery.kind,
        })
        .select('id')
        .single();

      if (error || !data) {
        return rollback(error?.message ?? 'Could not create the testing batteries.');
      }
      createdBatteries.push(data);
    }

    const items: { user_id: string; battery_id: string; test_template_id: string; order_index: number }[] = [];
    const anchors: {
      user_id: string; battery_id: string; anchor_kind: string;
      phase_id: string | null; position: string | null; scheduled_date: string | null;
    }[] = [];

    // Carries the ids forward so the schedule can be generated below.
    const scheduleInput: Battery[] = [];

    for (const [i, battery] of plan.batteries.entries()) {
      const batteryId = createdBatteries[i].id;

      battery.templateIds.forEach((templateId, order) => {
        items.push({
          user_id: user.id, battery_id: batteryId,
          test_template_id: templateId, order_index: order,
        });
      });

      const resolved: Anchor[] = [];
      for (const anchor of battery.anchors) {
        if (anchor.kind === 'date' && anchor.date) {
          anchors.push({
            user_id: user.id, battery_id: batteryId, anchor_kind: 'date',
            phase_id: null, position: null, scheduled_date: anchor.date,
          });
          resolved.push({ kind: 'date', date: anchor.date });
          continue;
        }
        // A phase anchor travelled as an index; turn it back into an id.
        if (anchor.phaseIndex === null || anchor.position === null) continue;
        const scheduledPhase = scheduled[anchor.phaseIndex];
        if (!scheduledPhase) continue;
        const phaseId = phaseIdByStart.get(scheduledPhase.startDate);
        if (!phaseId) continue;

        anchors.push({
          user_id: user.id, battery_id: batteryId, anchor_kind: 'phase',
          phase_id: phaseId, position: anchor.position, scheduled_date: null,
        });
        resolved.push({ kind: 'phase', phaseId, position: anchor.position });
      }

      scheduleInput.push({
        id: batteryId, name: battery.name, kind: battery.kind,
        anchors: resolved, templateIds: battery.templateIds,
      });
    }

    if (items.length > 0) {
      const { error } = await supabase.from('test_battery_items').insert(items);
      if (error) return rollback(error.message);
    }
    if (anchors.length > 0) {
      const { error } = await supabase.from('test_battery_anchors').insert(anchors);
      if (error) return rollback(error.message);
    }

    // The phases as the generator needs them: real ids, real boundaries.
    // Taken from `scheduled` rather than from the insert result, because
    // that is where both dates live.
    const schedulePhasesInput: SchedulePhase[] = scheduled.flatMap(s => {
      const id = phaseIdByStart.get(s.startDate);
      return id ? [{ id, start_date: s.startDate, end_date: s.endDate }] : [];
    });

    const scheduleError = await materialiseSchedule(
      supabase, user.id, created.id, plan.startDate, scheduleInput, schedulePhasesInput,
    );
    if (scheduleError) return rollback(scheduleError);
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
