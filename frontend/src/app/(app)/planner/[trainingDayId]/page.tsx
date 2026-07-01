import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { GymSessionCard } from '@/features/day-view/gym-session-card';
import { SwimSessionCard } from '@/features/day-view/swim-session-card';
import { RecoveryCard } from '@/features/day-view/recovery-card';
import { GenericSessionCard } from '@/features/day-view/generic-session-card';
import { ConditioningSessionCard } from '@/features/day-view/conditioning-session-card';

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
  exercises: { id: string; name: string; is_loggable: boolean };
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
      ? supabase.from('phases').select('id, name, phase_type').eq('id', trainingDay.phase_id).maybeSingle()
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
          exercises ( id, name, is_loggable )
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

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
