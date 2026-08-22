import { createClient } from '@/lib/supabase/server';
import { getWeeklyPrescription } from '@/lib/suggested-weight';

// Server-only. Never import this from a Client Component.

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

// ── completed-exposure counting ──────────────────────────────
//
// One exposure = one distinct training_day_session where an exercise_logs
// row exists for the exercise, that log's weight is not null, and the
// parent training_day_sessions.status = 'completed'. Counted per exercise,
// scoped to one phase instance, strictly before a given date.
//
// Returns null on query failure — callers must not treat null the same as
// a genuine zero. A failed lookup must never silently read as Step 1.

export async function getCompletedExposureCounts(
  exerciseIds: string[],
  phaseId: string,
  beforeDate: string,
  supabase: SupabaseClient,
): Promise<Map<string, number> | null> {
  if (exerciseIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from('exercise_logs')
    .select('exercise_id, training_day_session_id, training_day_sessions!inner(status, training_days!inner(phase_id, date))')
    .in('exercise_id', exerciseIds)
    .not('weight', 'is', null)
    .eq('training_day_sessions.status', 'completed')
    .eq('training_day_sessions.training_days.phase_id', phaseId)
    .lt('training_day_sessions.training_days.date', beforeDate);

  if (error) return null;

  // Distinct sessions per exercise — a duplicate log on the same session
  // must count once, not twice.
  const sessionsByExercise = new Map<string, Set<string>>();
  for (const row of data ?? []) {
    if (!sessionsByExercise.has(row.exercise_id)) {
      sessionsByExercise.set(row.exercise_id, new Set());
    }
    sessionsByExercise.get(row.exercise_id)!.add(row.training_day_session_id);
  }

  const counts = new Map<string, number>();
  for (const id of exerciseIds) {
    counts.set(id, sessionsByExercise.get(id)?.size ?? 0);
  }
  return counts;
}

// ── sequence length ───────────────────────────────────────────
//
// Probes the existing, unmodified getWeeklyPrescription() rather than
// hardcoding a step count anywhere — stays correct if the table's length
// ever changes, and needs no new export from suggested-weight.ts.

export function sequenceLength(phaseType: string): number {
  let n = 0;
  while (getWeeklyPrescription(phaseType, n + 1) !== null) n++;
  return n;
}
