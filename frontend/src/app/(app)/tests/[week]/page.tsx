import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { todayInTimezone } from '@/lib/today';
import { Card, CardContent } from '@/components/ui/card';
import { SESSIONS_BY_WEEK } from '@/features/tests/sessions-config';


// ── badge styles ──────────────────────────────────────────────

const blockStatusStyles: Record<string, string> = {
  pending:     'bg-teal-50 text-teal-700',
  in_progress: 'bg-blue-50 text-blue-600',
  completed:   'bg-emerald-50 text-emerald-700',
};

const blockStatusLabels: Record<string, string> = {
  pending:     'next',
  in_progress: 'in progress',
  completed:   'completed',
};

const sessionStatusStyles: Record<string, string> = {
  planned:     'bg-slate-100 text-slate-400',
  in_progress: 'bg-blue-50 text-blue-600',
  completed:   'bg-emerald-50 text-emerald-700',
};

const phaseTints: Record<string, string> = {
  adaptation:    'bg-teal-50 text-teal-700',
  accumulation:  'bg-orange-50 text-orange-700',
  transmutation: 'bg-amber-50 text-amber-700',
  realization:   'bg-yellow-50 text-yellow-700',
  competition:   'bg-emerald-50 text-emerald-700',
  reset:         'bg-slate-50 text-slate-500',
};

// ── helpers ───────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

// ── metadata ──────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ week: string }> }
): Promise<Metadata> {
  const { week } = await params;
  const weekNumber = parseInt(week.replace('week-', ''), 10);
  if (isNaN(weekNumber)) return { title: 'Tests · CURRENT' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { title: 'Tests · CURRENT' };

  const { data: macrocyclesRaw } = await supabase
    .from('macrocycles')
    .select('id')
    .order('start_date', { ascending: false })
    .limit(1);
  const macrocycleId = macrocyclesRaw?.[0]?.id ?? null;
  if (!macrocycleId) return { title: 'Tests · CURRENT' };

  const { data: block } = await supabase
    .from('testing_blocks')
    .select('purpose')
    .eq('user_id', user.id)
    .eq('macrocycle_id', macrocycleId)
    .eq('week_number', weekNumber)
    .maybeSingle();

  return { title: block ? `Week ${weekNumber} · Tests · CURRENT` : 'Tests · CURRENT' };
}

// ── page ──────────────────────────────────────────────────────

export default async function TestBlockPage(
  { params }: { params: Promise<{ week: string }> }
) {
  const { week } = await params;
  const weekNumber = parseInt(week.replace('week-', ''), 10);

  if (isNaN(weekNumber)) notFound();

  const supabase = await createClient();
  const cookieStore = await cookies();
  const today    = todayInTimezone(cookieStore.get('tz')?.value);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // ── macrocycle + current phase ────────────────────────────

  const { data: macrocyclesRaw } = await supabase
    .from('macrocycles')
    .select('id, name, goal_event, start_date, end_date')
    .order('start_date', { ascending: false })
    .limit(1);

  const macrocycle = macrocyclesRaw?.[0] ?? null;
  if (!macrocycle) notFound();

  const { data: phasesData } = await supabase
    .from('phases')
    .select('id, name, phase_type, start_date, end_date')
    .eq('macrocycle_id', macrocycle.id)
    .order('start_date', { ascending: true });

  const phases = phasesData ?? [];
  const currentPhase =
    phases.find(p => p.start_date <= today && p.end_date >= today) ??
    phases.find(p => p.start_date > today) ??
    phases[phases.length - 1] ??
    null;

  // ── fetch testing block (read-only — never upsert from here) ─

  const { data: blockRow } = await supabase
    .from('testing_blocks')
    .select('id, week_number, scheduled_date, purpose, status')
    .eq('user_id', user.id)
    .eq('macrocycle_id', macrocycle.id)
    .eq('week_number', weekNumber)
    .maybeSingle();

  if (!blockRow) notFound();

  // ── upsert planned sessions from config ───────────────────

  const weekConfig = SESSIONS_BY_WEEK[weekNumber] ?? null;

  if (weekConfig) {
    await supabase
      .from('testing_sessions')
      .upsert(
        weekConfig.map(s => ({
          user_id:          user.id,
          testing_block_id: blockRow.id,
          date:             s.date,
          session_type:     s.session_type,
          session_label:    s.label,
          status:           'planned',
        })),
        { onConflict: 'testing_block_id,session_label', ignoreDuplicates: true }
      );
  }

  // ── fetch sessions ────────────────────────────────────────

  const { data: sessionsRaw } = await supabase
    .from('testing_sessions')
    .select('id, session_label, session_type, date, status')
    .eq('testing_block_id', blockRow.id)
    .order('date', { ascending: true });

  // ── fetch results for completion tracking ─────────────────

  const { data: resultsRaw } = await supabase
    .from('test_results')
    .select('testing_session_id, test_template_id')
    .eq('testing_block_id', blockRow.id)
    .eq('user_id', user.id);

  // Build: session_id → set of completed template IDs
  const completionBySession = new Map<string, Set<string>>();
  for (const r of resultsRaw ?? []) {
    const sid = (r as { testing_session_id: string | null }).testing_session_id;
    if (!sid) continue;
    if (!completionBySession.has(sid)) completionBySession.set(sid, new Set());
    completionBySession.get(sid)!.add(r.test_template_id);
  }

  // Overall block progress
  const allCompletedTemplates = new Set(
    (resultsRaw ?? []).map(r => r.test_template_id)
  );
  const totalTests     = weekConfig?.reduce((sum, s) => sum + s.templates.length, 0) ?? 0;
  const completedTests = allCompletedTemplates.size;

  // ── build session cards ───────────────────────────────────

  const sessionCards = (sessionsRaw ?? []).map(s => {
    const config       = weekConfig?.find(c => c.label === s.session_label);
    const completedSet = completionBySession.get(s.id) ?? new Set<string>();
    const displayStatus =
      s.status === 'completed'  ? 'completed'  :
      completedSet.size > 0     ? 'in progress' :
      'planned';

    return {
      id:             s.id,
      session_label:  s.session_label ?? '',
      session_type:   s.session_type,
      date:           s.date,
      status:         displayStatus,
      templates:      config?.templates ?? [],
      completedCount: completedSet.size,
    };
  });

  // ── render ────────────────────────────────────────────────

  const blockStatus = blockRow.status as string;
  const phaseTint   = currentPhase
    ? (phaseTints[currentPhase.phase_type] ?? phaseTints.reset)
    : null;

  return (
    <div className="w-full max-w-[1120px] mx-auto px-5 pt-6 pb-8 sm:px-8 sm:pt-7 md:px-10 md:pt-8">

      {/* Back */}
      <Link
        href="/tests"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground/75 transition-colors mb-5"
      >
        <ChevronLeft className="h-3 w-3" />
        Tests
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Week {weekNumber}</h1>
          <p className="text-sm text-muted-foreground/60 mt-0.5">{blockRow.purpose}</p>
        </div>
        <div className="flex items-center gap-2 pt-1 shrink-0">
          <span className="text-xs text-muted-foreground/50 hidden sm:block">
            {blockRow.scheduled_date ? formatDate(blockRow.scheduled_date) : ''}
          </span>
          {currentPhase && phaseTint && (
            <>
              <span className="text-xs text-muted-foreground/30 hidden sm:block">·</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium lowercase tracking-wide ${phaseTint}`}>
                {currentPhase.phase_type}
              </span>
            </>
          )}
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium lowercase tracking-wide ${blockStatusStyles[blockStatus] ?? blockStatusStyles.pending}`}>
            {blockStatusLabels[blockStatus] ?? blockStatus}
          </span>
        </div>
      </div>

      {/* Progress summary */}
      <p className="text-xs text-muted-foreground/50 mb-6">
        <span className="font-medium text-foreground/60">{completedTests} of {totalTests} tests complete</span>
        {totalTests > 0 && completedTests < totalTests && (
          <>
            <span className="mx-1.5 text-muted-foreground/30">·</span>
            {totalTests - completedTests} remaining
          </>
        )}
      </p>

      {/* Session cards */}
      {weekConfig ? (
        <div className="space-y-3">
          {sessionCards.map(session => (
            <Card key={session.id}>
              <CardContent className="p-5">

                {/* Session header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground/45 mb-1">
                      {session.session_label}
                    </p>
                    <p className="text-sm text-muted-foreground/55">
                      {formatDate(session.date)}
                    </p>
                  </div>
                  <span className={`mt-0.5 shrink-0 px-2.5 py-1 rounded-full text-xs font-medium lowercase tracking-wide ${sessionStatusStyles[session.status] ?? sessionStatusStyles.planned}`}>
                    {session.status}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-border/30 mb-3" />

                {/* Test list */}
                <div className="space-y-1 mb-4">
                  {session.templates.map(name => (
                    <p key={name} className="text-sm text-foreground/70">{name}</p>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground/40">
                    {session.completedCount} / {session.templates.length} complete
                  </p>
                  <Link
                    href={`/tests/week-${weekNumber}/session/${session.id}`}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground/55 hover:text-foreground/75 transition-colors"
                  >
                    {session.status === 'completed' ? 'View Results' : 'Record Results'}
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground/50">
          Sessions are not yet configured for this testing block.
        </p>
      )}

    </div>
  );
}
