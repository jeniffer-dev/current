'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type SessionStatus = 'planned' | 'completed' | 'skipped';

export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus,
  trainingDayId: string,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('training_day_sessions')
    .update({
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (error) throw new Error(error.message);

  revalidatePath(`/planner/${trainingDayId}`);
  revalidatePath('/planner');
  revalidatePath('/dashboard');
  revalidatePath('/performance');
}

export async function upsertExerciseLog(
  sessionId:     string,
  exerciseId:    string,
  weight:        number | null,
  reps:          number | null,
  trainingDayId: string,
  existingLogId: string | undefined,
): Promise<{ logId: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let logId: string;

  if (existingLogId) {
    await supabase
      .from('exercise_logs')
      .update({ weight, reps, updated_at: new Date().toISOString() })
      .eq('id', existingLogId);
    logId = existingLogId;
  } else {
    const { data, error } = await supabase
      .from('exercise_logs')
      .insert({
        user_id:                 user.id,
        training_day_session_id: sessionId,
        exercise_id:             exerciseId,
        weight,
        reps,
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    logId = data.id;
  }

  revalidatePath(`/planner/${trainingDayId}`);
  return { logId };
}

export async function updateSessionNotes(
  sessionId: string,
  notes: string,
  trainingDayId: string,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('training_day_sessions')
    .update({
      notes:      notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (error) throw new Error(error.message);

  revalidatePath(`/planner/${trainingDayId}`);
  revalidatePath('/planner');
  revalidatePath('/dashboard');
  revalidatePath('/performance');
}
