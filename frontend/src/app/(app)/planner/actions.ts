'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { firstIssueMessage, planSessionSchema, unscheduleSessionSchema } from '@/lib/validation';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Rebuilds training_days.session_type from its training_day_sessions rows
// (source of truth) so legacy consumers keep working. Deletes the training_day
// when it has no sessions left.
async function syncSessionTypeString(
  supabase: SupabaseServerClient,
  trainingDayId: string,
): Promise<void> {
  const { data: sessions } = await supabase
    .from('training_day_sessions')
    .select('session_name')
    .eq('training_day_id', trainingDayId)
    .order('created_at', { ascending: true });

  const names = (sessions ?? []).map(s => s.session_name as string);

  if (names.length === 0) {
    await supabase.from('training_days').delete().eq('id', trainingDayId);
    return;
  }

  await supabase
    .from('training_days')
    .update({ session_type: names.join(' / '), updated_at: new Date().toISOString() })
    .eq('id', trainingDayId);
}

export async function planSession({
  sessionName,
  date,
  macrocycleId,
  phaseId,
  sessionType,
  templateId,
  weekDates,
}: {
  sessionName:  string;
  date:         string;
  macrocycleId: string;
  phaseId:      string | null;
  sessionType:  string;
  templateId:   string | null;
  weekDates:    string[];
}): Promise<void> {
  const parsed = planSessionSchema.safeParse({
    sessionName, date, macrocycleId, phaseId, sessionType, templateId, weekDates,
  });
  if (!parsed.success) throw new Error(firstIssueMessage(parsed));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Unique-template-per-week guard: a specific template (gym/swim) may be
  // scheduled only once across the 7 days of the week. Different templates of
  // the same type are allowed. Recurring activities carry no template_id and
  // are exempt.
  if (templateId) {
    const { data: duplicates } = await supabase
      .from('training_day_sessions')
      .select('id, training_days!inner(date)')
      .eq('user_id', user.id)
      .eq('template_id', templateId)
      .in('training_days.date', weekDates)
      .limit(1);

    if (duplicates && duplicates.length > 0) {
      throw new Error('This session is already scheduled this week.');
    }
  }

  // Find or create the training_day for this date.
  const { data: existing } = await supabase
    .from('training_days')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', date)
    .maybeSingle();

  // One-per-week guard for conditioning sessions.
  if (sessionType === 'conditioning') {
    const { data: conditioningThisWeek } = await supabase
      .from('training_day_sessions')
      .select('id, training_days!inner(date)')
      .eq('user_id', user.id)
      .eq('session_type', 'conditioning')
      .in('training_days.date', weekDates)
      .limit(1);

    if (conditioningThisWeek && conditioningThisWeek.length > 0) {
      throw new Error('A conditioning session is already scheduled this week.');
    }
  }

  // One-per-day guard: at most one gym and one swim session on the same day.
  // Other / recovery sessions are unlimited.
  if (existing && (sessionType === 'gym' || sessionType === 'swim')) {
    const { data: sameTypeToday } = await supabase
      .from('training_day_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('training_day_id', existing.id)
      .eq('session_type', sessionType)
      .limit(1);

    if (sameTypeToday && sameTypeToday.length > 0) {
      throw new Error(`This day already has a ${sessionType} session.`);
    }
  }

  let trainingDayId: string;

  if (existing) {
    trainingDayId = existing.id;
  } else {
    const { data: newDay, error } = await supabase
      .from('training_days')
      .insert({
        user_id:       user.id,
        macrocycle_id: macrocycleId,
        phase_id:      phaseId,
        date,
        status:        'planned',
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    trainingDayId = newDay.id;
  }

  const { error: sessionError } = await supabase
    .from('training_day_sessions')
    .insert({
      training_day_id: trainingDayId,
      user_id:         user.id,
      session_type:    sessionType,
      session_name:    sessionName,
      template_id:     templateId,
      status:          'planned',
    });

  if (sessionError) throw new Error(sessionError.message);

  await syncSessionTypeString(supabase, trainingDayId);

  revalidatePath('/planner');
  revalidatePath('/dashboard');
}

export async function unscheduleSession({
  sessionId,
  trainingDayId,
}: {
  sessionId:     string;
  trainingDayId: string;
}): Promise<void> {
  const parsed = unscheduleSessionSchema.safeParse({ sessionId, trainingDayId });
  if (!parsed.success) throw new Error(firstIssueMessage(parsed));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('training_day_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  await syncSessionTypeString(supabase, trainingDayId);

  revalidatePath('/planner');
  revalidatePath('/dashboard');
}
