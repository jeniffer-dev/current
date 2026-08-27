import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { activeMacrocycle } from '@/lib/macrocycle';
import { todayInTimezone } from '@/lib/today';
import { MacrocycleCard } from '@/features/dashboard/macrocycle-card';
import { PhaseCard } from '@/features/dashboard/phase-card';
import { CountdownCard } from '@/features/dashboard/countdown-card';
import { TrainingTodayCard } from '@/features/dashboard/training-today-card';
import { ConsistencyCard } from '@/features/dashboard/consistency-card';
import { LatestReflectionCard } from '@/features/dashboard/latest-reflection-card';
import type { LatestNote } from '@/features/dashboard/latest-reflection-card';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const data = await activeMacrocycle<{ name: string }>(supabase, 'name');
  return { title: `${data?.name ?? 'CURRENT'} · CURRENT` };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const today = todayInTimezone(cookieStore.get('tz')?.value);

  // ── batch 1: macrocycle + today + latest note (all independent) ─

  const [
    macrocycle,
    { data: trainingDay },
    { data: latestNoteRaw },
  ] = await Promise.all([
    activeMacrocycle<{
      id: string; name: string; goal_event: string | null;
      start_date: string; end_date: string;
      goal_event_date: string | null;
    }>(supabase, 'id, name, goal_event, goal_event_date, start_date, end_date'),
    supabase
      .from('training_days')
      .select('id, date, session_type, status, readiness_score, notes')
      .eq('date', today)
      .maybeSingle(),
    supabase
      .from('training_day_sessions')
      .select('notes, session_name, training_days(date)')
      .not('notes', 'is', null)
      .neq('notes', '')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  // ── batch 2: phases + today's sessions (depend on batch 1) ───

  const [{ data: phases }, { data: todaySessionsRaw }] = await Promise.all([
    macrocycle
      ? supabase
          .from('phases')
          .select('id, name, phase_type, start_date, end_date, volume, intensity')
          .eq('macrocycle_id', macrocycle.id)
          .order('start_date', { ascending: true })
      : Promise.resolve({ data: null, error: null }),
    trainingDay
      ? supabase
          .from('training_day_sessions')
          .select('id, session_name, status')
          .eq('training_day_id', trainingDay.id)
          .order('created_at', { ascending: true })
      : Promise.resolve({ data: null, error: null }),
  ]);

  const todaySessions: { id: string; session_name: string; status: string }[] =
    todaySessionsRaw ?? [];

  // ── current phase ────────────────────────────────────────────

  let currentPhase: {
    id: string;
    name: string;
    phase_type: string;
    start_date: string;
    end_date: string;
    volume: string | null;
    intensity: string | null;
  } | null = null;

  if (phases?.length) {
    currentPhase =
      phases.find(p => p.start_date <= today && p.end_date >= today) ??
      phases.find(p => p.start_date > today) ??
      phases[phases.length - 1] ??
      null;
  }

  // ── phase consistency ────────────────────────────────────────

  let phaseSessionData: { session_type: string; status: string }[] = [];

  if (currentPhase) {
    const { data: daysRaw } = await supabase
      .from('training_days')
      .select('id')
      .gte('date', currentPhase.start_date)
      .lte('date', currentPhase.end_date);

    const phaseTrainingDayIds = (daysRaw ?? []).map(d => d.id);

    if (phaseTrainingDayIds.length > 0) {
      const { data: sessionsRaw } = await supabase
        .from('training_day_sessions')
        .select('session_type, status')
        .in('training_day_id', phaseTrainingDayIds);

      phaseSessionData = sessionsRaw ?? [];
    }
  }

  // ── latest reflection ────────────────────────────────────────

  let latestNote: LatestNote | null = null;

  if (latestNoteRaw?.notes) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const td = (latestNoteRaw as any).training_days;
    const date = Array.isArray(td) ? (td[0]?.date ?? null) : (td?.date ?? null);
    latestNote = {
      text:        latestNoteRaw.notes,
      sessionName: latestNoteRaw.session_name,
      date,
    };
  }

  // ── render ───────────────────────────────────────────────────

  return (
    <div className="w-full max-w-[1120px] mx-auto px-5 pt-6 pb-8 sm:px-8 sm:pt-7 md:px-10 md:pt-8 space-y-4">

      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {macrocycle?.name ?? '—'}
        </h1>
      </div>

      {/* Row 1: Macrocycle + Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <MacrocycleCard macrocycle={macrocycle} today={today} />
        </div>
        <CountdownCard macrocycle={macrocycle} today={today} />
      </div>

      {/* Row 2: Today + Consistency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TrainingTodayCard trainingDay={trainingDay} sessions={todaySessions} />
        <ConsistencyCard
          phaseSessionData={phaseSessionData}
          phaseName={currentPhase?.name ?? null}
        />
      </div>

      {/* Row 3: Phase + Latest Reflection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PhaseCard phase={currentPhase} today={today} />
        <LatestReflectionCard note={latestNote} />
      </div>

    </div>
  );
}
