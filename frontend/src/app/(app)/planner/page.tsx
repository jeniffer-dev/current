import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { WeekNav } from '@/features/planner/week-nav';
import { WeekPlannerBoard } from '@/features/planner/week-planner-board';

export const metadata: Metadata = { title: 'Planner — CURRENT' };

// ── date helpers ──────────────────────────────────────────────

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getWeekStart(macrocycleStart: string, weekOffset: number): Date {
  const start = new Date(macrocycleStart + 'T00:00:00');
  return addDays(start, weekOffset * 7);
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

function getCurrentWeekOffset(macrocycleStart: string, today: string): number {
  const start = new Date(macrocycleStart + 'T00:00:00').getTime();
  const now = new Date(today + 'T00:00:00').getTime();
  const diff = now - start;
  if (diff < 0) return 0;
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

// ── types ─────────────────────────────────────────────────────

export type TrainingDay = {
  id: string;
  date: string;
  session_type: string | null;
  status: string;
  notes: string | null;
};

export type Phase = {
  id: string;
  name: string;
  phase_type: string;
  start_date: string;
  end_date: string;
};

export type SessionStatus = {
  id: string;
  session_name: string;
  session_type: string;
  status: 'planned' | 'completed' | 'skipped';
  template_id: string | null;
};

const phaseTints: Record<string, string> = {
  adaptation:    'bg-teal-50 text-teal-700',
  accumulation:  'bg-orange-50 text-orange-700',
  transmutation: 'bg-amber-50 text-amber-700',
  realization:   'bg-yellow-50 text-yellow-700',
  competition:   'bg-emerald-50 text-emerald-700',
  reset:         'bg-slate-50 text-slate-500',
};

// ── page ──────────────────────────────────────────────────────

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const supabase = await createClient();
  const today = toDateStr(new Date());
  const params = await searchParams;

  // Fetch macrocycle
  const { data: macrocycles } = await supabase
    .from('macrocycles')
    .select('id, name, goal_event, start_date, end_date')
    .order('start_date', { ascending: false })
    .limit(1);

  const macrocycle = macrocycles?.[0] ?? null;

  if (!macrocycle) {
    return (
      <div className="w-full max-w-[1120px] mx-auto px-5 pt-6 pb-8 sm:px-8 sm:pt-7 md:px-10 md:pt-8">
        <h1 className="text-2xl font-semibold tracking-tight">Planner</h1>
        <p className="mt-1 text-sm text-muted-foreground">No active macrocycle.</p>
      </div>
    );
  }

  // Determine week dates (only needs macrocycle.start_date)
  const defaultOffset = getCurrentWeekOffset(macrocycle.start_date, today);
  const weekOffset = params.w !== undefined ? Math.max(0, parseInt(params.w, 10)) : defaultOffset;
  const weekStart = getWeekStart(macrocycle.start_date, weekOffset);
  const weekDays = getWeekDays(weekStart);
  const weekEnd = weekDays[6];
  const weekNumber = weekOffset + 1;

  // Sort Mon→Sun for display; dates and scheduling are unaffected
  weekDays.sort((a, b) => ((a.getDay() + 6) % 7) - ((b.getDay() + 6) % 7));
  const weekStartStr = toDateStr(weekStart);
  const weekEndStr = toDateStr(weekEnd);

  // Fetch phases + gym templates + swim templates + training days in parallel
  const [{ data: phasesData }, { data: gymTemplatesData }, { data: swimTemplatesData }, { data: trainingDaysData }] =
    await Promise.all([
      supabase
        .from('phases')
        .select('id, name, phase_type, start_date, end_date')
        .eq('macrocycle_id', macrocycle.id)
        .order('start_date', { ascending: true }),
      supabase
        .from('gym_session_templates')
        .select('id, name, phase_type')
        .order('name', { ascending: true }),
      supabase
        .from('swim_session_templates')
        .select('id, name')
        .order('name', { ascending: true }),
      supabase
        .from('training_days')
        .select('id, date, session_type, status, notes')
        .gte('date', weekStartStr)
        .lte('date', weekEndStr)
        .order('date', { ascending: true }),
    ]);

  const phases: Phase[] = (phasesData ?? []) as Phase[];
  const gymTemplates = (gymTemplatesData ?? []) as { id: string; name: string; phase_type: string | null }[];
  const swimTemplates = (swimTemplatesData ?? []) as { id: string; name: string }[];

  // Phase for this week (based on week midpoint)
  const weekMidStr = toDateStr(addDays(weekStart, 3));
  const weekPhase = phases.find(p => p.start_date <= weekMidStr && p.end_date >= weekMidStr) ?? null;

  const trainingDays = (trainingDaysData ?? []) as TrainingDay[];
  const byDate       = new Map<string, TrainingDay>(trainingDays.map(d => [d.date, d]));

  // Fetch training_day_sessions for all days in this week
  const trainingDayIds = trainingDays.map(d => d.id);
  const sessionsByDayId = new Map<string, SessionStatus[]>();

  if (trainingDayIds.length > 0) {
    const { data: sessionsRaw } = await supabase
      .from('training_day_sessions')
      .select('id, training_day_id, session_name, session_type, status, template_id')
      .in('training_day_id', trainingDayIds)
      .order('created_at', { ascending: true });

    for (const s of sessionsRaw ?? []) {
      const list = sessionsByDayId.get(s.training_day_id) ?? [];
      list.push({
        id:           s.id,
        session_name: s.session_name,
        session_type: s.session_type,
        status:       s.status as 'planned' | 'completed' | 'skipped',
        template_id:  s.template_id ?? null,
      });
      sessionsByDayId.set(s.training_day_id, list);
    }
  }

  return (
    <div className="w-full max-w-[1120px] mx-auto px-5 pt-6 pb-8 sm:px-8 sm:pt-7 md:px-10 md:pt-8 space-y-4">

      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Week {weekNumber}</h1>
          {weekPhase && (
            <>
              <span className="text-foreground/20">·</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium tracking-wide ${phaseTints[weekPhase.phase_type] ?? phaseTints.reset}`}>
                {weekPhase.name}
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-muted-foreground/60 mt-0.5">
          {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {' – '}
          {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Week navigation */}
      <WeekNav
        weekNumber={weekNumber}
        weekStart={weekStart}
        weekEnd={weekEnd}
        weekOffset={weekOffset}
      />

      {/* Weekly planning board */}
      <WeekPlannerBoard
        weekDays={weekDays.map(day => {
          const dateStr = toDateStr(day);
          const trainingDay = byDate.get(dateStr) ?? null;
          const sessions = trainingDay ? (sessionsByDayId.get(trainingDay.id) ?? []) : [];
          return {
            dateStr,
            label:         day.toLocaleDateString('en-US', { weekday: 'long' }),
            sublabel:      day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            isToday:       dateStr === today,
            trainingDayId: trainingDay?.id ?? null,
            sessions,
          };
        })}
        catalog={[
          ...gymTemplates.map(t => ({
            templateId:  t.id,
            sessionName: `Gym ${t.name}`,
            sessionType: 'gym',
            recommended: !!weekPhase && t.phase_type === weekPhase.phase_type,
          })),
          ...swimTemplates.map(t => ({
            templateId:  t.id,
            sessionName: t.name,
            sessionType: 'swim',
            recommended: false,
          })),
        ]}
        weekDates={weekDays.map(toDateStr)}
        macrocycleId={macrocycle.id}
        phaseId={weekPhase?.id ?? null}
      />
    </div>
  );
}
