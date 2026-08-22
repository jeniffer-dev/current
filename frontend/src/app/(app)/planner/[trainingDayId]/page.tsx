import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { GymSessionCard } from '@/features/day-view/gym-session-card';
import { SwimSessionCard } from '@/features/day-view/swim-session-card';
import { RecoveryCard } from '@/features/day-view/recovery-card';
import { GenericSessionCard } from '@/features/day-view/generic-session-card';
import { ConditioningSessionCard } from '@/features/day-view/conditioning-session-card';
import { buildTestSuggestion, buildLogSuggestion, getWeeklyPrescription } from '@/lib/suggested-weight';
import type { WeightSuggestion, WeekPrescription } from '@/lib/suggested-weight';
import { getCompletedExposureCounts, sequenceLength } from '@/lib/progression';

// ── types ─────────────────────────────────────────────────────

type GymExercise = {
  id: string;
  order_index: number;
  sets: number | null;
  reps: string | null;
  rpe: string | null;
  intensity_type: string;
  intensity_value: string | null;
  notes: string | null;
  exercises: { id: string; name: string; is_loggable: boolean; primary_test_template_id: string | null };
};

type GymTemplate = {
  id: string;
  name: string;
  focus: string | null;
  gym_session_exercises: GymExercise[];
};

type SwimTemplate = {
  id: string;
  name: string;
  swim_type: string;
  distance_meters: number | null;
  focus: string | null;
};

type SessionRecord = {
  id: string;
  session_name: string;
  status: 'planned' | 'completed' | 'skipped';
  notes: string | null;
};

// ── helpers ───────────────────────────────────────────────────

function parseSessions(sessionType: string): string[] {
  return sessionType.split('/').map(s => s.trim()).filter(Boolean);
}

function isGym(session: string)          { return /^gym\s+/i.test(session); }
function isSwim(session: string)         { return /\bswim\b/i.test(session); }
function isRecovery(session: string)     { return /^recovery$/i.test(session.trim()); }
function isConditioning(session: string) { return /^(aerobic|anaerobic|alactic)\s+session\s+\d+$/i.test(session.trim()); }

function gymTemplateName(session: string): string {
  return session.replace(/^gym\s+/i, '').trim();
}

function swimTypeFromSession(session: string): string {
  const lower = session.toLowerCase();
  if (lower.includes('endurance')) return 'endurance';
  if (lower.includes('anaerobic')) return 'anaerobic';
  if (lower.includes('alactic'))   return 'alactic';
  if (lower.includes('technique')) return 'technique';
  if (lower.includes('speed'))     return 'alactic';
  return 'endurance';
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
    year:    'numeric',
  });
}

function getWeekNumber(macrocycleStart: string, dayDate: string): number {
  const start = new Date(macrocycleStart + 'T00:00:00').getTime();
  const day   = new Date(dayDate + 'T00:00:00').getTime();
  const diff  = day - start;
  if (diff < 0) return 1;
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}

const phaseTints: Record<string, string> = {
  adaptation:    'bg-teal-50 text-teal-700',
  accumulation:  'bg-orange-50 text-orange-700',
  transmutation: 'bg-amber-50 text-amber-700',
  realization:   'bg-yellow-50 text-yellow-700',
  competition:   'bg-emerald-50 text-emerald-700',
  reset:         'bg-slate-50 text-slate-500',
};

// ── page ──────────────────────────────────────────────────────

export default async function DayViewPage({
  params,
}: {
  params: Promise<{ trainingDayId: string }>;
}) {
  const { trainingDayId } = await params;
  const supabase = await createClient();

  // Fetch training day
  const { data: trainingDay } = await supabase
    .from('training_days')
    .select('id, date, session_type, status, notes, phase_id, macrocycle_id')
    .eq('id', trainingDayId)
    .maybeSingle();

  if (!trainingDay) notFound();

  // Fetch phase, macrocycle, and session records in parallel
  const [{ data: phase }, { data: macrocycle }, { data: sessionRecordsRaw }] = await Promise.all([
    trainingDay.phase_id
      ? supabase.from('phases').select('id, name, phase_type, start_date').eq('id', trainingDay.phase_id).maybeSingle()
      : Promise.resolve({ data: null }),
    trainingDay.macrocycle_id
      ? supabase.from('macrocycles').select('id, start_date').eq('id', trainingDay.macrocycle_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('training_day_sessions')
      .select('id, session_name, status, notes')
      .eq('training_day_id', trainingDayId)
      .order('created_at', { ascending: true }),
  ]);

  const weekNumber = macrocycle
    ? getWeekNumber(macrocycle.start_date, trainingDay.date)
    : null;

  // Build lookup: session_name → session record
  const sessionsByName = new Map<string, SessionRecord>(
    (sessionRecordsRaw ?? []).map(r => [r.session_name, r as SessionRecord])
  );

  // Parse sessions
  const sessions = trainingDay.session_type
    ? parseSessions(trainingDay.session_type)
    : [];

  // Fetch gym templates
  const gymNames = sessions.filter(isGym).map(gymTemplateName);
  const gymTemplates: Record<string, GymTemplate | null> = {};

  for (const name of gymNames) {
    const { data } = await supabase
      .from('gym_session_templates')
      .select(`
        id, name, focus,
        gym_session_exercises (
          id, order_index, sets, reps, rpe, intensity_type, intensity_value, notes,
          exercises ( id, name, is_loggable, primary_test_template_id )
        )
      `)
      .eq('name', name)
      .maybeSingle();
    gymTemplates[name] = (data as GymTemplate | null);
  }

  // Fetch swim templates
  const swimSessions = sessions.filter(s => isSwim(s) && !isGym(s));
  const swimTemplates: Record<string, SwimTemplate | null> = {};

  for (const session of swimSessions) {
    const swimType = swimTypeFromSession(session);
    const { data } = await supabase
      .from('swim_session_templates')
      .select('id, name, swim_type, distance_meters, focus')
      .eq('swim_type', swimType)
      .limit(1)
      .maybeSingle();
    swimTemplates[session] = (data as SwimTemplate | null);
  }

  // ── Exercise logs ────────────────────────────────────────────
  // Fetch logs for all gym sessions in one query, keyed by session ID

  const gymSessionIds = sessions
    .filter(isGym)
    .map(s => sessionsByName.get(s)?.id)
    .filter((id): id is string => !!id);

  type ExerciseLog = {
    id: string;
    exercise_id: string;
    training_day_session_id: string;
    weight: number | null;
    reps: number | null;
  };

  const exerciseLogsBySessionId = new Map<string, ExerciseLog[]>();

  if (gymSessionIds.length > 0) {
    const { data: logsRaw } = await supabase
      .from('exercise_logs')
      .select('id, exercise_id, training_day_session_id, weight, reps')
      .in('training_day_session_id', gymSessionIds);

    for (const log of logsRaw ?? []) {
      if (!exerciseLogsBySessionId.has(log.training_day_session_id)) {
        exerciseLogsBySessionId.set(log.training_day_session_id, []);
      }
      exerciseLogsBySessionId.get(log.training_day_session_id)!.push(log as ExerciseLog);
    }
  }

  // ── Suggested weights ────────────────────────────────────────
  // Collect loggable exercises, fetch latest test results + historical logs,
  // then build a suggestion per exercise (test-based > log-based).

  const allLoggableExercises = Object.values(gymTemplates)
    .flatMap(t => t?.gym_session_exercises ?? [])
    .filter(ex => ex.exercises.is_loggable);

  const testTemplateIds = [...new Set(
    allLoggableExercises
      .map(ex => ex.exercises.primary_test_template_id)
      .filter((id): id is string => !!id)
  )];

  const allLoggableExerciseIds = [...new Set(
    allLoggableExercises.map(ex => ex.exercises.id)
  )];

  const [testResultsResult, histLogsResult] = await Promise.all([
    testTemplateIds.length > 0
      ? supabase
          .from('test_results')
          .select('test_template_id, estimated_1rm_kg')
          .in('test_template_id', testTemplateIds)
          .not('estimated_1rm_kg', 'is', null)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as Array<{ test_template_id: string; estimated_1rm_kg: number | null }> }),
    allLoggableExerciseIds.length > 0
      ? supabase
          .from('exercise_logs')
          .select('exercise_id, weight, reps')
          .in('exercise_id', allLoggableExerciseIds)
          .order('logged_at', { ascending: false })
      : Promise.resolve({ data: [] as Array<{ exercise_id: string; weight: number | null; reps: number | null }> }),
  ]);

  // Latest result per test template (first row = most recent due to desc ordering)
  const latestTestResult = new Map<string, number>();
  for (const r of testResultsResult.data ?? []) {
    if (!latestTestResult.has(r.test_template_id) && r.estimated_1rm_kg != null) {
      latestTestResult.set(r.test_template_id, r.estimated_1rm_kg);
    }
  }

  // Latest log per exercise (first row = most recent)
  const latestLogByExercise = new Map<string, { weight: number; reps: number }>();
  for (const l of histLogsResult.data ?? []) {
    if (!latestLogByExercise.has(l.exercise_id) && l.weight != null && l.reps != null) {
      latestLogByExercise.set(l.exercise_id, { weight: l.weight, reps: l.reps });
    }
  }

  const phaseType   = phase?.phase_type ?? '';
  const weekInPhase = phase && 'start_date' in phase && phase.start_date
    ? getWeekNumber(phase.start_date, trainingDay.date)
    : 1;

  // ── Completion-driven progression (Accumulation main lifts) ──────
  // Progression clock: which prescribed step comes next, per lift, based on
  // completed exposures — independent of where the calendar says we are.
  // Outside Accumulation, getWeeklyPrescription() already returns null for
  // any input, so behaviour there is unchanged.

  const isAccumulation = phaseType === 'accumulation';

  const accExerciseIds = isAccumulation
    ? [...new Set(
        allLoggableExercises
          .filter(ex => ex.exercises.primary_test_template_id)
          .map(ex => ex.exercises.id)
      )]
    : [];

  let exposureCounts: Map<string, number> | null = null;
  if (isAccumulation && phase?.id && accExerciseIds.length > 0) {
    exposureCounts = await getCompletedExposureCounts(
      accExerciseIds, phase.id, trainingDay.date, supabase
    );
  }
  // exposureCounts stays null when the lookup fails — callers below must
  // not treat that the same as a genuine zero (never render Step 1 on error).
  const exposureCountsFailed = isAccumulation && accExerciseIds.length > 0 && exposureCounts === null;

  const stepByExerciseId = new Map<string, number>();
  if (exposureCounts) {
    for (const id of accExerciseIds) {
      stepByExerciseId.set(id, (exposureCounts.get(id) ?? 0) + 1);
    }
  }

  const prescriptionsByExerciseId: Record<string, WeekPrescription | null> = {};
  for (const [exId, step] of stepByExerciseId) {
    prescriptionsByExerciseId[exId] = getWeeklyPrescription(phaseType, step);
  }

  const suggestionsByExerciseId: Record<string, WeightSuggestion> = {};

  for (const ex of allLoggableExercises) {
    const exId        = ex.exercises.id;
    const testTmplId  = ex.exercises.primary_test_template_id;

    if (testTmplId) {
      const oneRM = latestTestResult.get(testTmplId);
      if (oneRM != null) {
        if (isAccumulation) {
          // Correctness-first: on a failed exposure lookup, show no
          // suggestion at all rather than risk a wrong or stale one.
          if (exposureCountsFailed) continue;

          const step = stepByExerciseId.get(exId);
          if (step != null) {
            const s = buildTestSuggestion(oneRM, phaseType, step);
            if (s) { suggestionsByExerciseId[exId] = s; continue; }
          }
        } else {
          const s = buildTestSuggestion(oneRM, phaseType, weekInPhase);
          if (s) { suggestionsByExerciseId[exId] = s; continue; }
        }
      }
    }

    const lastLog = latestLogByExercise.get(exId);
    if (lastLog) {
      suggestionsByExerciseId[exId] = buildLogSuggestion(lastLog.weight, lastLog.reps);
    }
  }

  // ── Phase-boundary notice ─────────────────────────────────────────
  // Stateless and self-clearing: a lift is flagged when it stopped mid-
  // sequence in the previous phase instance AND has zero completed
  // exposures so far in the current one. The moment it gets its first
  // exposure here, it silently drops out — no state is persisted.
  // CURRENT warns; it does not decide carry-over, reset, or anything else.

  type PhaseBoundaryNotice = {
    exerciseName:      string;
    completedInPrevious: number;
    sequenceLength:    number;
    previousPhaseName: string;
  };
  const phaseBoundaryNotices: PhaseBoundaryNotice[] = [];

  if (phase?.id && phase.start_date && trainingDay.macrocycle_id) {
    const { data: previousPhase } = await supabase
      .from('phases')
      .select('id, name, phase_type, start_date')
      .eq('macrocycle_id', trainingDay.macrocycle_id)
      .lt('start_date', phase.start_date)
      .order('start_date', { ascending: false })
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    const previousHasSequence = previousPhase
      ? getWeeklyPrescription(previousPhase.phase_type, 1) !== null
      : false;

    if (previousPhase && previousHasSequence) {
      // Lifts in scope for that previous phase type: tested lifts that were
      // actually prescribed there, derived from data — never a hardcoded
      // exercise list.
      type ScopedLiftRow = {
        exercise_id: string;
        exercises: { name: string; primary_test_template_id: string | null };
      };

      const { data: scopedRows } = await supabase
        .from('gym_session_exercises')
        .select('exercise_id, exercises!inner(name, primary_test_template_id), gym_session_templates!inner(phase_type)')
        .eq('intensity_type', 'percentage')
        .eq('gym_session_templates.phase_type', previousPhase.phase_type)
        .not('exercises.primary_test_template_id', 'is', null);

      const scopedExerciseNames = new Map<string, string>();
      for (const row of (scopedRows as ScopedLiftRow[] | null) ?? []) {
        scopedExerciseNames.set(row.exercise_id, row.exercises.name);
      }
      const scopedIds = [...scopedExerciseNames.keys()];

      if (scopedIds.length > 0) {
        const [previousCounts, currentCounts] = await Promise.all([
          getCompletedExposureCounts(scopedIds, previousPhase.id, trainingDay.date, supabase),
          phase.id
            ? getCompletedExposureCounts(scopedIds, phase.id, trainingDay.date, supabase)
            : Promise.resolve(null),
        ]);

        // Fail closed: an unreliable lookup shows no notice rather than a
        // possibly-wrong one. This is secondary, advisory information.
        if (previousCounts && currentCounts) {
          const seqLen = sequenceLength(previousPhase.phase_type);
          for (const exId of scopedIds) {
            const completedInPrevious = previousCounts.get(exId) ?? 0;
            const completedInCurrent  = currentCounts.get(exId) ?? 0;
            if (completedInPrevious < seqLen && completedInCurrent === 0) {
              phaseBoundaryNotices.push({
                exerciseName:        scopedExerciseNames.get(exId)!,
                completedInPrevious,
                sequenceLength:      seqLen,
                previousPhaseName:   previousPhase.name,
              });
            }
          }
        }
      }
    }
  }

  // ── Summary stats ────────────────────────────────────────────
  const sessionCount = sessions.filter(s => !isRecovery(s)).length;

  const totalExercises = Object.values(gymTemplates).reduce(
    (sum, t) => sum + (t?.gym_session_exercises?.length ?? 0), 0
  );

  const totalSwimMeters = swimSessions.reduce(
    (sum, session) => sum + (swimTemplates[session]?.distance_meters ?? 0), 0
  );

  const summaryParts: string[] = [];
  if (sessionCount > 0) summaryParts.push(`${sessionCount} ${sessionCount === 1 ? 'Session' : 'Sessions'}`);
  if (totalExercises > 0) summaryParts.push(`${totalExercises} Exercises`);
  if (totalSwimMeters > 0) summaryParts.push(`${totalSwimMeters.toLocaleString()}m Swim`);

  // ── Session completion summary ────────────────────────────────
  const trackableSessions = sessions.filter(s => !isRecovery(s));
  const completedCount = trackableSessions.filter(s => sessionsByName.get(s)?.status === 'completed').length;

  return (
    <div className="w-full max-w-[1120px] mx-auto px-5 pt-6 pb-8 sm:px-8 sm:pt-7 md:px-10 md:pt-8 space-y-4">

      {/* Back link */}
      <Link
        href="/planner"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground/60 hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Planner
      </Link>

      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {formatFullDate(trainingDay.date)}
        </h1>

        {/* Week + phase context */}
        <div className="flex items-center gap-2 mt-1.5">
          {weekNumber && (
            <span className="text-sm text-muted-foreground/60">Week {weekNumber}</span>
          )}
          {weekNumber && phase && (
            <span className="text-muted-foreground/30 text-sm">·</span>
          )}
          {phase && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${phaseTints[phase.phase_type] ?? phaseTints.reset}`}>
              {phase.name}
            </span>
          )}
        </div>

        {/* Session summary */}
        {summaryParts.length > 0 && (
          <div className="flex items-center gap-2 mt-2.5">
            {summaryParts.map((part, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-muted-foreground/25 text-xs">·</span>}
                <span className="text-xs text-muted-foreground/55">{part}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 lg:gap-8 items-start">

        {/* Left: session cards */}
        {sessions.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-12 text-center">
            <p className="text-sm font-medium text-foreground/60">No sessions planned.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, i) => {
              const sessionRecord = sessionsByName.get(session) ?? null;

              if (isRecovery(session)) {
                return <RecoveryCard key={i} />;
              }

              if (isGym(session)) {
                const templateName = gymTemplateName(session);
                return (
                  <GymSessionCard
                    key={i}
                    sessionName={session}
                    template={gymTemplates[templateName] ?? null}
                    sessionRecord={sessionRecord}
                    trainingDayId={trainingDayId}
                    exerciseLogs={sessionRecord ? (exerciseLogsBySessionId.get(sessionRecord.id) ?? []) : []}
                    suggestionsByExerciseId={suggestionsByExerciseId}
                    prescriptionsByExerciseId={prescriptionsByExerciseId}
                  />
                );
              }

              if (isSwim(session)) {
                const swimTemplate = swimTemplates[session];
                return (
                  <SwimSessionCard
                    key={i}
                    sessionName={session}
                    swimType={swimTypeFromSession(session)}
                    distanceMeters={swimTemplate?.distance_meters}
                    sessionRecord={sessionRecord}
                    trainingDayId={trainingDayId}
                  />
                );
              }

              if (isConditioning(session)) {
                return (
                  <ConditioningSessionCard
                    key={i}
                    sessionName={session}
                    sessionRecord={sessionRecord}
                    trainingDayId={trainingDayId}
                  />
                );
              }

              return <GenericSessionCard key={i} sessionName={session} sessionRecord={sessionRecord} trainingDayId={trainingDayId} />;
            })}
          </div>
        )}

        {/* Right: day context panel (desktop only) */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <div className="rounded-xl border border-border bg-card p-5">

              {/* CYCLE */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/40 mb-2.5">
                  Cycle
                </p>
                <div className="space-y-1">
                  {weekNumber && (
                    <p className="text-sm font-semibold">Week {weekNumber}</p>
                  )}
                  {phase && (
                    <p className="text-sm text-muted-foreground/60">{phase.name}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-border/35 my-4" />

              {/* WORKLOAD */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/40 mb-2.5">
                  Workload
                </p>
                <div className="space-y-1">
                  {sessionCount > 0 && (
                    <p className="text-sm font-semibold">{sessionCount} {sessionCount === 1 ? 'Session' : 'Sessions'}</p>
                  )}
                  {totalExercises > 0 && (
                    <p className="text-sm text-muted-foreground/60">{totalExercises} Exercises</p>
                  )}
                  {totalSwimMeters > 0 && (
                    <p className="text-sm text-muted-foreground/60">{totalSwimMeters.toLocaleString()} m Swim</p>
                  )}
                </div>
              </div>

              <div className="border-t border-border/35 my-4" />

              {/* STATUS */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/40 mb-2.5">
                  Progress
                </p>
                {trackableSessions.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">
                      {completedCount} / {trackableSessions.length} completed
                    </p>
                    {trackableSessions.map((s, i) => {
                      const rec = sessionsByName.get(s);
                      const done    = rec?.status === 'completed';
                      const skipped = rec?.status === 'skipped';
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <span className={`text-xs ${done ? 'text-teal-600' : skipped ? 'text-slate-400' : 'text-muted-foreground/40'}`}>
                            {done ? '✓' : skipped ? '—' : '○'}
                          </span>
                          <span className={`text-xs truncate ${done ? 'text-foreground/60' : 'text-muted-foreground/50'}`}>{s}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/40">Rest day</p>
                )}
              </div>

              {(() => {
                const sessionNotes = trackableSessions
                  .map(s => ({ name: s, notes: sessionsByName.get(s)?.notes ?? null }))
                  .filter(s => s.notes);

                if (sessionNotes.length === 0) return null;

                return (
                  <>
                    <div className="border-t border-border/35 my-4" />
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/40 mb-3">
                        Notes
                      </p>
                      <div className="space-y-3">
                        {sessionNotes.map(({ name, notes }) => (
                          <div key={name}>
                            <p className="text-[10px] text-muted-foreground/40 mb-1 truncate">{name}</p>
                            <p className="text-xs text-muted-foreground/60 leading-relaxed">
                              {notes!.length > 120 ? notes!.slice(0, 120).trimEnd() + '…' : notes}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}

              {phaseBoundaryNotices.length > 0 && (
                <>
                  <div className="border-t border-border/35 my-4" />
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/40 mb-3">
                      Progression
                    </p>
                    <div className="space-y-2">
                      {phaseBoundaryNotices.map((n) => (
                        <p key={n.exerciseName} className="text-xs text-muted-foreground/60 leading-relaxed">
                          {n.exerciseName} stopped at {n.completedInPrevious} of {n.sequenceLength} in {n.previousPhaseName}.
                        </p>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
