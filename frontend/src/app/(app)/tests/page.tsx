import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { NextTestingBlock } from '@/features/tests/next-testing-block';
import { TestingTimeline } from '@/features/tests/testing-timeline';
import { TestingHistory } from '@/features/tests/recent-results';
import type { TestingHistoryBlock, BlockResult } from '@/features/tests/recent-results';
import { SESSIONS_BY_WEEK } from '@/features/tests/sessions-config';

// Per-block session view derived from the same source of truth the week
// detail page uses (SESSIONS_BY_WEEK). Weeks without config return [].
function getSessions(weekNumber: number) {
  return (SESSIONS_BY_WEEK[weekNumber] ?? []).map(s => ({
    date:         s.date,
    session_type: s.session_type,
    templates:    [...s.templates],
  }));
}

export const metadata: Metadata = { title: 'Tests · CURRENT' };

// ── phase tints ───────────────────────────────────────────────

const phaseTints: Record<string, string> = {
  adaptation:    'bg-teal-50 text-teal-700',
  accumulation:  'bg-orange-50 text-orange-700',
  transmutation: 'bg-amber-50 text-amber-700',
  realization:   'bg-yellow-50 text-yellow-700',
  competition:   'bg-emerald-50 text-emerald-700',
  reset:         'bg-slate-50 text-slate-500',
};

type BlockStatus = 'next' | 'future' | 'completed';

// ── page ──────────────────────────────────────────────────────

export default async function TestsPage() {
  const supabase = await createClient();
  const today    = new Date().toISOString().split('T')[0];

  // ── macrocycle + current phase ────────────────────────────────

  const { data: macrocyclesRaw } = await supabase
    .from('macrocycles')
    .select('id, name, goal_event, start_date, end_date')
    .order('start_date', { ascending: false })
    .limit(1);

  const macrocycle = macrocyclesRaw?.[0] ?? null;

  let currentPhase: { name: string; phase_type: string } | null = null;

  if (macrocycle) {
    const { data: phasesData } = await supabase
      .from('phases')
      .select('id, name, phase_type, start_date, end_date')
      .eq('macrocycle_id', macrocycle.id)
      .order('start_date', { ascending: true });

    const phases = phasesData ?? [];
    currentPhase =
      phases.find(p => p.start_date <= today && p.end_date >= today) ??
      phases.find(p => p.start_date > today) ??
      phases[phases.length - 1] ??
      null;
  }

  // ── testing blocks from DB (single source of truth) ───────────

  let allDbBlocks: { id: string; week_number: number; purpose: string | null; scheduled_date: string | null; status: string }[] = [];

  if (macrocycle) {
    const { data: dbBlocksRaw } = await supabase
      .from('testing_blocks')
      .select('id, week_number, purpose, scheduled_date, status')
      .eq('macrocycle_id', macrocycle.id)
      .order('week_number', { ascending: true });

    allDbBlocks = dbBlocksRaw ?? [];
  }

  // ── derive display status for each block ──────────────────────
  // Completed (from DB) stays completed; first remaining → 'next'; rest → 'future'

  let nextAssigned = false;

  const blocksWithStatus = allDbBlocks.map(block => {
    let status: BlockStatus;
    if (block.status === 'completed') {
      status = 'completed';
    } else if (!nextAssigned) {
      nextAssigned = true;
      status = 'next';
    } else {
      status = 'future';
    }
    return {
      id:             block.id,
      week_number:    block.week_number,
      purpose:        block.purpose || `Week ${block.week_number}`,
      scheduled_date: block.scheduled_date,
      status,
    };
  });

  // ── hero card: first non-completed block ──────────────────────

  const nextBlock = blocksWithStatus.find(b => b.status !== 'completed') ?? null;

  // ── testing history (completed blocks with grouped results) ──

  let historyBlocks: TestingHistoryBlock[] = [];

  if (allDbBlocks.length > 0) {
    const blockIds = allDbBlocks.map(b => b.id);

    const { data: resultsRaw } = await supabase
      .from('test_results')
      .select('id, test_template_id, result_value, testing_block_id, test_templates(name, category, metric_type, unit)')
      .in('testing_block_id', blockIds)
      .order('created_at', { ascending: true });

    // One result per template per block — last write wins (most recent, query is asc)
    const seenKeys = new Set<string>();
    const deduped = (resultsRaw ?? []).reverse().filter(r => {
      const key = `${r.testing_block_id}::${r.test_template_id}`;
      if (seenKeys.has(key)) return false;
      seenKeys.add(key);
      return true;
    });

    const resultsByBlock = new Map<string, BlockResult[]>();
    for (const r of deduped) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ttRaw = (r as any).test_templates;
      const tt = Array.isArray(ttRaw) ? ttRaw[0] : ttRaw;
      if (!tt) continue;
      if (!resultsByBlock.has(r.testing_block_id)) resultsByBlock.set(r.testing_block_id, []);
      resultsByBlock.get(r.testing_block_id)!.push({
        id:           r.id,
        name:         tt.name        ?? '',
        category:     tt.category    ?? 'other',
        metric_type:  tt.metric_type ?? '',
        result_value: r.result_value,
        unit:         tt.unit        ?? '',
      });
    }

    // Only include blocks that have at least one result; most recent first
    historyBlocks = [...allDbBlocks]
      .reverse()
      .filter(b => (resultsByBlock.get(b.id) ?? []).length > 0)
      .map(b => ({
        id:             b.id,
        week_number:    b.week_number,
        purpose:        b.purpose        ?? '',
        scheduled_date: b.scheduled_date ?? null,
        results:        resultsByBlock.get(b.id) ?? [],
      }));
  }

  // ── render ────────────────────────────────────────────────────

  const phaseTint = currentPhase
    ? (phaseTints[currentPhase.phase_type] ?? phaseTints.reset)
    : null;

  return (
    <div className="w-full max-w-[1120px] mx-auto px-5 pt-6 pb-8 sm:px-8 sm:pt-7 md:px-10 md:pt-8 space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tests</h1>
          <p className="text-sm text-muted-foreground/60 mt-0.5">
            Performance checkpoints throughout the macrocycle
          </p>
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
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium lowercase tracking-wide ${phaseTint}`}
              >
                {currentPhase.phase_type}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Section 1 — Next Testing Block */}
      {nextBlock && (
        <NextTestingBlock
          block={{
            week_number:    nextBlock.week_number,
            scheduled_date: nextBlock.scheduled_date,
            status:         nextBlock.status,
            purpose:        nextBlock.purpose,
            sessions:       getSessions(nextBlock.week_number),
          }}
        />
      )}

      {/* Section 2 — Testing Timeline */}
      <TestingTimeline
        blocks={blocksWithStatus.map(b => ({
          id:             b.id,
          week_number:    b.week_number,
          status:         b.status,
          purpose:        b.purpose,
          scheduled_date: b.scheduled_date,
          sessions:       getSessions(b.week_number),
        }))}
      />

      {/* Section 3 — Testing History */}
      <TestingHistory blocks={historyBlocks} />

    </div>
  );
}
