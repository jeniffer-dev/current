import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { scopedMacrocycle } from '@/lib/macrocycle';
import { todayInTimezone } from '@/lib/today';

export const metadata: Metadata = { title: 'Content Audit · CURRENT' };

// ── helpers ───────────────────────────────────────────────────

function fmt(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });
}

function fmtFull(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function weeksBetween(start: string, end: string): number {
  const s = new Date(start + 'T00:00:00').getTime();
  const e = new Date(end + 'T00:00:00').getTime();
  return Math.ceil((e - s) / (7 * 24 * 60 * 60 * 1000));
}

function formatResult(value: number, metricType: string, unit: string): string {
  if (metricType === 'time') {
    if (value >= 60) {
      const mins = Math.floor(value / 60);
      const secs = Math.round(value % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${value}s`;
  }
  if (unit === 'level') return String(Math.round(value));
  const n = value % 1 === 0 ? value : parseFloat(value.toFixed(1));
  return unit ? `${n} ${unit}` : String(n);
}

// ── status badge ──────────────────────────────────────────────

function statusClass(status: string): string {
  if (status === 'completed')   return 'bg-teal-50 text-teal-700';
  if (status === 'in_progress') return 'bg-amber-50 text-amber-700';
  return 'bg-slate-50 text-slate-500';
}

// ── section heading ───────────────────────────────────────────

function SectionHeading({ num, label, count }: { num: number; label: string; count: number }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-border pb-2 mb-4">
      <span className="text-xs text-muted-foreground/40 tabular-nums">{num}</span>
      <h2 className="text-sm font-semibold uppercase tracking-wider">{label}</h2>
      <span className="text-xs text-muted-foreground/50 ml-auto tabular-nums">{count}</span>
    </div>
  );
}

// ── expandable row ────────────────────────────────────────────

function Row({ summary, children }: { summary: React.ReactNode; children: React.ReactNode }) {
  return (
    <details className="group border border-border/50 rounded-lg">
      <summary className="px-4 py-3 cursor-pointer flex items-center gap-3 hover:bg-muted/30 select-none list-none [&::-webkit-details-marker]:hidden">
        <span className="text-muted-foreground/30 group-open:text-muted-foreground/60 text-xs transition-transform group-open:rotate-90">▶</span>
        {summary}
      </summary>
      <div className="px-4 pb-4 pt-1 border-t border-border/40">
        {children}
      </div>
    </details>
  );
}

// ── page ──────────────────────────────────────────────────────

export default async function AuditPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const today = todayInTimezone(cookieStore.get('tz')?.value);

  // Macrocycle
  const macrocycle = await scopedMacrocycle<{
    id: string; name: string; goal_event: string | null;
    start_date: string; end_date: string;
  }>(supabase, today, 'id, name, goal_event, start_date, end_date');

  // Everything else in parallel
  const [
    phasesRes,
    gymRes,
    swimRes,
    exercisesRes,
    blocksRes,
    testTemplatesRes,
  ] = await Promise.all([
    macrocycle
      ? supabase.from('phases').select('id, name, phase_type, start_date, end_date').eq('macrocycle_id', macrocycle.id).order('start_date')
      : Promise.resolve({ data: [] as never[] }),
    supabase
      .from('gym_session_templates')
      .select(`
        id, name, phase_type, focus,
        gym_session_exercises (
          id, order_index, sets, reps, intensity_type, intensity_value, notes,
          exercises ( id, name, is_loggable )
        )
      `)
      .order('name'),
    supabase
      .from('swim_session_templates')
      .select('id, name, swim_type, distance_meters, focus')
      .order('name'),
    supabase
      .from('exercises')
      .select('id, name, category, movement_pattern, main_muscle, is_loggable')
      .order('name'),
    macrocycle
      ? supabase.from('testing_blocks').select('id, week_number, purpose, scheduled_date, status').eq('macrocycle_id', macrocycle.id).order('week_number')
      : Promise.resolve({ data: [] as never[] }),
    supabase
      .from('test_templates')
      .select('id, name, category, metric_type, unit')
      .order('category, name'),
  ]);

  const phases        = phasesRes.data        ?? [];
  const gymTemplates  = gymRes.data           ?? [];
  const swimTemplates = swimRes.data          ?? [];
  const exercises     = exercisesRes.data     ?? [];
  const blocks        = blocksRes.data        ?? [];
  const testTemplates = testTemplatesRes.data ?? [];

  // Test results for completed blocks
  const completedBlockIds = blocks
    .filter((b: { status: string }) => b.status === 'completed')
    .map((b: { id: string }) => b.id);

  let testResults: {
    id: string;
    testing_block_id: string;
    result_value: number;
    test_template_id: string;
    test_templates: { name: string; category: string; metric_type: string; unit: string } | null;
  }[] = [];

  if (completedBlockIds.length > 0) {
    const { data } = await supabase
      .from('test_results')
      .select('id, testing_block_id, result_value, test_template_id, test_templates(name, category, metric_type, unit)')
      .in('testing_block_id', completedBlockIds)
      .order('created_at', { ascending: true });
    testResults = (data ?? []).map((r: { id: string; testing_block_id: string; result_value: number; test_template_id: string; test_templates: unknown }) => ({
      ...r,
      test_templates: (() => {
        const tt = r.test_templates;
        if (!tt) return null;
        const t = Array.isArray(tt) ? tt[0] : tt;
        return t as { name: string; category: string; metric_type: string; unit: string } | null;
      })(),
    }));
  }

  // Group results by block
  const resultsByBlock = new Map<string, typeof testResults>();
  for (const r of testResults) {
    if (!resultsByBlock.has(r.testing_block_id)) resultsByBlock.set(r.testing_block_id, []);
    resultsByBlock.get(r.testing_block_id)!.push(r);
  }

  // Expected tests for pending blocks (all templates, grouped by category)
  const strengthTemplates = testTemplates.filter((t: { category: string }) => t.category === 'strength');
  const waterTemplates    = testTemplates.filter((t: { category: string }) => t.category === 'in_water');

  return (
    <div className="w-full max-w-[1120px] mx-auto px-5 pt-6 pb-12 sm:px-8 sm:pt-7 md:px-10 md:pt-8 space-y-10">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Content Audit</h1>
          <p className="text-sm text-muted-foreground/60 mt-0.5">Read-only review of the training model</p>
        </div>
        <span className="mt-1 text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 shrink-0">Audit</span>
      </div>

      {/* Summary counts */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {[
          { label: 'Phases',          count: phases.length },
          { label: 'Gym Templates',   count: gymTemplates.length },
          { label: 'Swim Templates',  count: swimTemplates.length },
          { label: 'Exercises',       count: exercises.length },
          { label: 'Testing Blocks',  count: blocks.length },
        ].map(({ label, count }) => (
          <div key={label} className="border border-border rounded-lg p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">{count}</p>
            <p className="text-xs text-muted-foreground/60 mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Section 1 — Macrocycle ────────────────────────────── */}
      <section>
        <SectionHeading num={1} label="Macrocycle" count={phases.length} />

        {!macrocycle ? (
          <p className="text-sm text-muted-foreground/50">No macrocycle found.</p>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-lg font-semibold">{macrocycle.name}</p>
              {macrocycle.goal_event && (
                <p className="text-sm text-muted-foreground/60">{macrocycle.goal_event}</p>
              )}
              <p className="text-xs text-muted-foreground/40 mt-1 tabular-nums">
                {fmtFull(macrocycle.start_date)} → {fmtFull(macrocycle.end_date)}
              </p>
            </div>

            <div className="border border-border/50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">Phase</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">Dates</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">Weeks</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {(phases as { id: string; name: string; phase_type: string; start_date: string; end_date: string }[]).map((phase) => (
                    <tr key={phase.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{phase.name}</td>
                      <td className="px-4 py-3 text-muted-foreground/70 tabular-nums text-xs">
                        {fmt(phase.start_date)} – {fmt(phase.end_date)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground/70 tabular-nums">{weeksBetween(phase.start_date, phase.end_date)}w</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground/50 capitalize">{phase.phase_type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ── Section 2 — Gym Templates ─────────────────────────── */}
      <section>
        <SectionHeading num={2} label="Gym Templates" count={gymTemplates.length} />
        <div className="space-y-1.5">
          {(gymTemplates as unknown as {
            id: string;
            name: string;
            phase_type: string | null;
            focus: string | null;
            gym_session_exercises: {
              id: string;
              order_index: number;
              sets: number | null;
              reps: string | null;
              intensity_type: string;
              intensity_value: string | null;
              notes: string | null;
              exercises: { id: string; name: string; is_loggable: boolean } | null;
            }[];
          }[]).map((tmpl) => {
            const exs = [...(tmpl.gym_session_exercises ?? [])].sort((a, b) => a.order_index - b.order_index);
            return (
              <Row
                key={tmpl.id}
                summary={
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-medium text-sm">{tmpl.name}</span>
                    {tmpl.phase_type && (
                      <span className="text-xs text-muted-foreground/50 capitalize">{tmpl.phase_type}</span>
                    )}
                    {tmpl.focus && (
                      <span className="text-xs text-muted-foreground/40 truncate hidden sm:block">{tmpl.focus}</span>
                    )}
                    <span className="text-xs text-muted-foreground/40 ml-auto shrink-0">{exs.length} exercises</span>
                  </div>
                }
              >
                <div className="mt-2 space-y-0.5">
                  {exs.map((ex, i) => {
                    const name = ex.exercises?.name ?? '—';
                    const loggable = ex.exercises?.is_loggable ?? false;
                    const sets = ex.sets != null ? `${ex.sets} × ` : '';
                    const reps = ex.reps ?? '—';
                    const intensity = ex.intensity_value
                      ? ex.intensity_type === 'percentage'
                        ? `${ex.intensity_value}%`
                        : ex.intensity_value
                      : null;
                    return (
                      <div key={ex.id} className="flex items-center gap-3 py-1 border-b border-border/20 last:border-0">
                        <span className="w-5 text-xs text-muted-foreground/30 tabular-nums shrink-0">{i + 1}</span>
                        <span className="text-sm flex-1">{name}</span>
                        <span className="text-xs text-muted-foreground/50 tabular-nums shrink-0">
                          {sets}{reps}{intensity ? `  ·  ${intensity}` : ''}
                        </span>
                        {loggable && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-600 shrink-0">log</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Row>
            );
          })}
        </div>
      </section>

      {/* ── Section 3 — Swim Templates ────────────────────────── */}
      <section>
        <SectionHeading num={3} label="Swim Templates" count={swimTemplates.length} />
        <div className="space-y-1.5">
          {(swimTemplates as {
            id: string;
            name: string;
            swim_type: string;
            distance_meters: number | null;
            focus: string | null;
          }[]).map((tmpl) => (
            <Row
              key={tmpl.id}
              summary={
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="font-medium text-sm">{tmpl.name}</span>
                  <span className="text-xs text-muted-foreground/50 capitalize">{tmpl.swim_type}</span>
                  {tmpl.distance_meters && (
                    <span className="text-xs text-muted-foreground/40 tabular-nums ml-auto shrink-0">
                      {tmpl.distance_meters.toLocaleString()} m
                    </span>
                  )}
                </div>
              }
            >
              <div className="mt-2 space-y-1.5 text-sm">
                <div className="flex gap-3">
                  <span className="text-xs text-muted-foreground/40 w-24 shrink-0">System</span>
                  <span className="text-xs capitalize">{tmpl.swim_type}</span>
                </div>
                {tmpl.distance_meters && (
                  <div className="flex gap-3">
                    <span className="text-xs text-muted-foreground/40 w-24 shrink-0">Distance</span>
                    <span className="text-xs tabular-nums">{tmpl.distance_meters.toLocaleString()} m</span>
                  </div>
                )}
                {tmpl.focus && (
                  <div className="flex gap-3">
                    <span className="text-xs text-muted-foreground/40 w-24 shrink-0">Focus</span>
                    <span className="text-xs">{tmpl.focus}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground/30 pt-1 italic">
                  No set breakdown in schema — distance only.
                </p>
              </div>
            </Row>
          ))}
        </div>
      </section>

      {/* ── Section 4 — Exercises ─────────────────────────────── */}
      <section>
        <SectionHeading num={4} label="Exercises" count={exercises.length} />

        <div className="border border-border/50 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 hidden md:table-cell">Pattern</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 hidden md:table-cell">Muscle</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {(exercises as {
                id: string;
                name: string;
                category: string | null;
                movement_pattern: string | null;
                main_muscle: string | null;
                is_loggable: boolean;
              }[]).map((ex) => (
                <tr key={ex.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2 font-medium">{ex.name}</td>
                  <td className="px-4 py-2 text-muted-foreground/60 text-xs capitalize hidden sm:table-cell">
                    {ex.category ?? '—'}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground/60 text-xs capitalize hidden md:table-cell">
                    {ex.movement_pattern ?? '—'}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground/60 text-xs capitalize hidden md:table-cell">
                    {ex.main_muscle ?? '—'}
                  </td>
                  <td className="px-4 py-2">
                    {ex.is_loggable
                      ? <span className="text-xs text-teal-600 font-medium">Yes</span>
                      : <span className="text-xs text-muted-foreground/30">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 5 — Testing Blocks ────────────────────────── */}
      <section>
        <SectionHeading num={5} label="Testing Blocks" count={blocks.length} />
        <div className="space-y-1.5">
          {(blocks as {
            id: string;
            week_number: number;
            purpose: string | null;
            scheduled_date: string | null;
            status: string;
          }[]).map((block) => {
            const results = resultsByBlock.get(block.id) ?? [];
            const strengthResults = results.filter(r => r.test_templates?.category === 'strength');
            const waterResults    = results.filter(r => r.test_templates?.category === 'in_water');
            const isCompleted     = block.status === 'completed';

            return (
              <Row
                key={block.id}
                summary={
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-medium text-sm">Week {block.week_number}</span>
                    {block.purpose && (
                      <span className="text-xs text-muted-foreground/50 truncate hidden sm:block">{block.purpose}</span>
                    )}
                    <div className="flex items-center gap-2 ml-auto shrink-0">
                      {block.scheduled_date && (
                        <span className="text-xs text-muted-foreground/40 tabular-nums">{fmt(block.scheduled_date)}</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusClass(block.status)}`}>
                        {block.status}
                      </span>
                    </div>
                  </div>
                }
              >
                <div className="mt-3 space-y-4">
                  {isCompleted && results.length === 0 && (
                    <p className="text-xs text-muted-foreground/40 italic">Completed — no results recorded.</p>
                  )}

                  {/* Strength results (completed) or expected (pending) */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2">
                      Strength Tests
                    </p>
                    <div className="space-y-1">
                      {isCompleted ? (
                        strengthResults.length > 0
                          ? strengthResults.map(r => (
                              <div key={r.id} className="flex items-center justify-between gap-4">
                                <span className="text-sm">{r.test_templates?.name ?? '—'}</span>
                                <span className="text-xs text-muted-foreground/60 tabular-nums">
                                  {r.test_templates
                                    ? formatResult(r.result_value, r.test_templates.metric_type, r.test_templates.unit)
                                    : r.result_value}
                                </span>
                              </div>
                            ))
                          : <p className="text-xs text-muted-foreground/30">—</p>
                      ) : (
                        strengthTemplates.map((t: { id: string; name: string }) => (
                          <div key={t.id} className="flex items-center justify-between gap-4">
                            <span className="text-sm">{t.name}</span>
                            <span className="text-xs text-muted-foreground/25">—</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* In-water results (completed) or expected (pending) */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2">
                      In-Water Tests
                    </p>
                    <div className="space-y-1">
                      {isCompleted ? (
                        waterResults.length > 0
                          ? waterResults.map(r => (
                              <div key={r.id} className="flex items-center justify-between gap-4">
                                <span className="text-sm">{r.test_templates?.name ?? '—'}</span>
                                <span className="text-xs text-muted-foreground/60 tabular-nums">
                                  {r.test_templates
                                    ? formatResult(r.result_value, r.test_templates.metric_type, r.test_templates.unit)
                                    : r.result_value}
                                </span>
                              </div>
                            ))
                          : <p className="text-xs text-muted-foreground/30">—</p>
                      ) : (
                        waterTemplates.map((t: { id: string; name: string }) => (
                          <div key={t.id} className="flex items-center justify-between gap-4">
                            <span className="text-sm">{t.name}</span>
                            <span className="text-xs text-muted-foreground/25">—</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </Row>
            );
          })}
        </div>
      </section>

    </div>
  );
}
