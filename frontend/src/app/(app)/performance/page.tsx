import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { activeMacrocycle } from '@/lib/macrocycle';
import { todayInTimezone } from '@/lib/today';
import { epley1RM } from '@/lib/suggested-weight';
import { TestingBlock } from '@/features/performance/testing-block';
import { StrengthProgression } from '@/features/performance/strength-progression';
import { SwimProgression } from '@/features/performance/swim-progression';
import { ConsistencyBlock } from '@/features/performance/consistency-block';
import { TestingHistory } from '@/features/performance/testing-history';
import { TrainingProgression } from '@/features/performance/training-progression';
import type { BlockInfo } from '@/features/performance/testing-block';
import type { ProgressionCard } from '@/features/performance/strength-progression';
import type { PhaseSessionData } from '@/features/performance/consistency-block';
import type { TestingMetricHistory } from '@/features/performance/testing-history';
import type { ExerciseProgression, ExerciseEntry } from '@/features/performance/training-progression';

export const metadata: Metadata = { title: 'Performance · CURRENT' };

// ── constants ─────────────────────────────────────────────────

const STRENGTH_TESTS = ['Back Squat 3RM', 'Deadlift 3RM', 'Bench Press 3RM', 'Supinated Pull Up 1RM'];
const SWIM_TESTS     = ['400m Swim', 'Beep Test', '8x25 UW', '25UW / 25FS'];
const ALL_TESTS      = [...STRENGTH_TESTS, ...SWIM_TESTS];

// ── types ─────────────────────────────────────────────────────

type Macrocycle = {
  id: string;
  name: string;
  goal_event: string | null;
  start_date: string;
  end_date: string;
};

type Phase = {
  id: string;
  name: string;
  phase_type: string;
  start_date: string;
  end_date: string;
};

// ── helpers ───────────────────────────────────────────────────

const phaseTints: Record<string, string> = {
  adaptation:    'bg-teal-50 text-teal-700',
  accumulation:  'bg-orange-50 text-orange-700',
  transmutation: 'bg-amber-50 text-amber-700',
  realization:   'bg-yellow-50 text-yellow-700',
  competition:   'bg-emerald-50 text-emerald-700',
  reset:         'bg-slate-50 text-slate-500',
};

// ── page ──────────────────────────────────────────────────────

export default async function PerformancePage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const today = todayInTimezone(cookieStore.get('tz')?.value);

  // ── macrocycle (needed for everything else) ─────────────────

  const macrocycle = await activeMacrocycle<Macrocycle>(
    supabase,
    'id, name, goal_event, start_date, end_date',
  );

  // ── batch: phases + testing blocks + exercise logs (parallel) ─

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let blocksRaw: any[] = [];
  let phases: Phase[] = [];
  let currentPhase: Phase | null = null;
  let exerciseProgressions: ExerciseProgression[] = [];

  if (macrocycle) {
    const [{ data: phasesData }, { data: blocksData }, { data: logsRaw }] =
      await Promise.all([
        supabase
          .from('phases')
          .select('id, name, phase_type, start_date, end_date')
          .eq('macrocycle_id', macrocycle.id)
          .order('start_date', { ascending: true }),
        supabase
          .from('testing_blocks')
          .select('id, week_number, purpose, scheduled_date, status, updated_at')
          .eq('macrocycle_id', macrocycle.id)
          .order('week_number', { ascending: true }),
        supabase
          .from('exercise_logs')
          .select('id, weight, reps, logged_at, exercises(name, is_loggable)')
          .order('logged_at', { ascending: false }),
      ]);

    phases = (phasesData ?? []) as Phase[];
    currentPhase =
      phases.find(p => p.start_date <= today && p.end_date >= today) ??
      phases.find(p => p.start_date > today) ??
      phases[phases.length - 1] ??
      null;

    blocksRaw = blocksData ?? [];

    // ── exercise logs (training progression) ──────────────────

    // Group by (exercise, date) keeping the top set per day (highest estimated 1RM).
    // If a day has only null-estimated entries (weight logged without reps), keep one.
    type DayBest = { weight: number | null; reps: number | null; estimated1RM: number | null };
    const bestByExerciseDate = new Map<string, Map<string, DayBest>>();

    for (const log of logsRaw ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const exRaw = (log as any).exercises;
      const ex = Array.isArray(exRaw) ? exRaw[0] : exRaw;
      if (!ex?.is_loggable) continue;

      const date = (log.logged_at as string).split('T')[0];
      const est  = log.weight && log.reps
        ? Math.round(epley1RM(log.weight, log.reps) * 10) / 10
        : null;

      if (!bestByExerciseDate.has(ex.name)) bestByExerciseDate.set(ex.name, new Map());
      const dayMap = bestByExerciseDate.get(ex.name)!;

      const existing = dayMap.get(date);
      if (!existing || (est !== null && (existing.estimated1RM === null || est > existing.estimated1RM))) {
        dayMap.set(date, { weight: log.weight, reps: log.reps, estimated1RM: est });
      }
    }

    const progressionMap = new Map<string, ExerciseEntry[]>();
    for (const [name, dayMap] of bestByExerciseDate) {
      const entries: ExerciseEntry[] = [...dayMap.entries()]
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 20)
        .map(([date, best]) => ({ date, weight: best.weight, reps: best.reps, estimated1RM: best.estimated1RM }));
      progressionMap.set(name, entries);
    }

    exerciseProgressions = [...progressionMap.entries()].map(([name, entries]) => ({
      exerciseName: name,
      entries,
    }));
  }

  const completedBlocks = blocksRaw.filter((b) => b.status === 'completed');
  const completedBlockCount = completedBlocks.length;

  const nextBlockRaw =
    blocksRaw.find((b) => b.status === 'in_progress') ??
    blocksRaw.find((b) => b.status === 'pending') ??
    null;

  const lastCompletedBlockRaw = completedBlocks[completedBlocks.length - 1] ?? null;

  const nextBlock: BlockInfo | null = nextBlockRaw
    ? {
        id:            nextBlockRaw.id,
        weekNumber:    nextBlockRaw.week_number,
        purpose:       nextBlockRaw.purpose ?? '',
        scheduledDate: nextBlockRaw.scheduled_date ?? null,
        status:        nextBlockRaw.status,
        updatedAt:     nextBlockRaw.updated_at,
      }
    : null;

  const lastCompletedBlock: BlockInfo | null = lastCompletedBlockRaw
    ? {
        id:            lastCompletedBlockRaw.id,
        weekNumber:    lastCompletedBlockRaw.week_number,
        purpose:       lastCompletedBlockRaw.purpose ?? '',
        scheduledDate: lastCompletedBlockRaw.scheduled_date ?? null,
        status:        'completed',
        updatedAt:     lastCompletedBlockRaw.updated_at,
      }
    : null;

  // ── test results (shared between progression cards + testing history) ──

  const templateMap: Record<string, {
    name:        string;
    metric_type: string;
    unit:        string;
    byBlock:     Record<string, number>;
  }> = {};

  if (blocksRaw.length > 0) {
    const allBlockIds = blocksRaw.map((b) => b.id);

    const { data: resultsRaw } = await supabase
      .from('test_results')
      .select('test_template_id, result_value, testing_block_id, test_templates(name, metric_type, unit)')
      .in('testing_block_id', allBlockIds)
      .order('created_at', { ascending: true });

    for (const r of resultsRaw ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ttRaw = (r as any).test_templates;
      const tt = Array.isArray(ttRaw) ? ttRaw[0] : ttRaw;
      if (!tt) continue;

      if (!templateMap[r.test_template_id]) {
        templateMap[r.test_template_id] = {
          name:        tt.name,
          metric_type: tt.metric_type,
          unit:        tt.unit ?? '',
          byBlock:     {},
        };
      }
      if (templateMap[r.test_template_id].byBlock[r.testing_block_id] === undefined) {
        templateMap[r.test_template_id].byBlock[r.testing_block_id] = r.result_value;
      }
    }
  }

  // ── progression cards (requires 2+ completed blocks) ────────

  let strengthCards: ProgressionCard[] = [];
  let swimCards:     ProgressionCard[] = [];

  if (completedBlockCount >= 2) {
    const firstBlockId = completedBlocks[0].id;
    const lastBlockId  = completedBlocks[completedBlockCount - 1].id;

    for (const data of Object.values(templateMap)) {
      if (!ALL_TESTS.includes(data.name)) continue;
      const before = data.byBlock[firstBlockId];
      const after  = data.byBlock[lastBlockId];
      if (before == null || after == null) continue;

      const card: ProgressionCard = {
        name:        data.name,
        metric_type: data.metric_type,
        unit:        data.unit,
        before,
        after,
      };

      if (STRENGTH_TESTS.includes(data.name)) strengthCards.push(card);
      else if (SWIM_TESTS.includes(data.name))  swimCards.push(card);
    }

    strengthCards.sort((a, b) => STRENGTH_TESTS.indexOf(a.name) - STRENGTH_TESTS.indexOf(b.name));
    swimCards.sort((a, b)     => SWIM_TESTS.indexOf(a.name)     - SWIM_TESTS.indexOf(b.name));
  }

  // ── testing history (all metrics, all blocks timeline) ──────

  const testOrder = [...STRENGTH_TESTS, ...SWIM_TESTS];

  // Only include blocks that have at least one result, regardless of status
  const blocksWithResults = blocksRaw.filter(b =>
    Object.values(templateMap).some(tmpl => tmpl.byBlock[b.id] !== undefined)
  );

  const testingMetrics: TestingMetricHistory[] = Object.values(templateMap)
    .map(tmpl => ({
      name:        tmpl.name,
      unit:        tmpl.unit,
      metric_type: tmpl.metric_type,
      entries:     blocksWithResults.map(block => ({
        weekNumber: block.week_number,
        value:      tmpl.byBlock[block.id] ?? null,
      })),
    }))
    .sort((a, b) => {
      const ai = testOrder.indexOf(a.name);
      const bi = testOrder.indexOf(b.name);
      if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

  // ── training day sessions (current phase — for Consistency) ──

  let phaseSessionData: PhaseSessionData[] = [];

  if (currentPhase && macrocycle) {
    const { data: daysRaw } = await supabase
      .from('training_days')
      .select('id')
      .eq('macrocycle_id', macrocycle.id)
      .gte('date', currentPhase.start_date)
      .lte('date', currentPhase.end_date);

    const phaseTrainingDayIds = (daysRaw ?? []).map(d => d.id);

    if (phaseTrainingDayIds.length > 0) {
      const { data: sessionsRaw } = await supabase
        .from('training_day_sessions')
        .select('id, session_type, session_name, status')
        .in('training_day_id', phaseTrainingDayIds)
        .order('created_at', { ascending: true });

      phaseSessionData = (sessionsRaw ?? []).map(s => ({
        sessionType: s.session_type,
        sessionName: s.session_name,
        status:      s.status,
      }));
    }
  }

  // ── render ──────────────────────────────────────────────────

  const phaseTint = currentPhase
    ? (phaseTints[currentPhase.phase_type] ?? phaseTints.reset)
    : null;

  return (
    <div className="w-full max-w-[1120px] mx-auto px-5 pt-6 pb-8 sm:px-8 sm:pt-7 md:px-10 md:pt-8 space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Performance</h1>
          <p className="text-sm text-muted-foreground/60 mt-0.5">Am I getting better?</p>
        </div>
        <div className="flex items-center gap-2 pt-1 shrink-0">
          {macrocycle?.goal_event && (
            <span className="text-xs text-muted-foreground/50 hidden sm:block">
              {macrocycle.goal_event}
            </span>
          )}
          {currentPhase && phaseTint && (
            <>
              {macrocycle?.goal_event && (
                <span className="text-xs text-muted-foreground/30 hidden sm:block">·</span>
              )}
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium lowercase tracking-wide ${phaseTint}`}>
                {currentPhase.phase_type}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Section 1 — Testing Checkpoint */}
      <TestingBlock
        nextBlock={nextBlock}
        lastCompletedBlock={lastCompletedBlock}
      />

      {/* Section 2 — Strength Progression */}
      <StrengthProgression
        cards={strengthCards}
        completedBlockCount={completedBlockCount}
      />

      {/* Section 3 + 4 — Swim & Consistency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SwimProgression
          cards={swimCards}
          completedBlockCount={completedBlockCount}
        />
        <ConsistencyBlock
          phaseSessionData={phaseSessionData}
          phaseName={currentPhase?.name ?? null}
          phaseEndDate={currentPhase?.end_date ?? null}
          today={today}
        />
      </div>

      {/* Section 5 — Testing History */}
      <TestingHistory metrics={testingMetrics} />

      {/* Section 6 — Training Progression */}
      <TrainingProgression progressions={exerciseProgressions} />

    </div>
  );
}
