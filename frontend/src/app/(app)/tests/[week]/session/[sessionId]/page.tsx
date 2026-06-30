import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { SESSIONS_BY_WEEK } from '@/features/tests/sessions-config';
import {
  ResultForm,
  type FormSection,
  type PrevResult,
  type CurrentResult,
} from '@/features/tests/result-form';

// ── helpers ───────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
    year:    'numeric',
  });
}

function formatLabel(raw: string): string {
  return raw.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
}

const phaseTints: Record<string, string> = {
  adaptation:    'bg-teal-50 text-teal-700',
  accumulation:  'bg-orange-50 text-orange-700',
  transmutation: 'bg-amber-50 text-amber-700',
  realization:   'bg-yellow-50 text-yellow-700',
  competition:   'bg-emerald-50 text-emerald-700',
  reset:         'bg-slate-50 text-slate-500',
};

const sessionStatusStyles: Record<string, string> = {
  planned:   'bg-slate-100 text-slate-400',
  completed: 'bg-emerald-50 text-emerald-700',
};

// ── metadata ──────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ week: string; sessionId: string }> }
): Promise<Metadata> {
  const { week } = await params;
  const weekNumber = parseInt(week.replace('week-', ''), 10);
  return { title: `Week ${weekNumber} · Tests · CURRENT` };
}

// ── page ──────────────────────────────────────────────────────

export default async function TestSessionPage(
  { params }: { params: Promise<{ week: string; sessionId: string }> }
) {
  const { week, sessionId } = await params;
  const weekNumber = parseInt(week.replace('week-', ''), 10);
  if (isNaN(weekNumber)) notFound();

  const supabase = await createClient();
  const today    = new Date().toISOString().split('T')[0];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // ── fetch session ─────────────────────────────────────────

  const { data: session } = await supabase
    .from('testing_sessions')
    .select('id, session_label, session_type, date, status, testing_block_id')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (!session) notFound();

  // ── resolve config for this session ───────────────────────

  const weekConfig    = SESSIONS_BY_WEEK[weekNumber];
  const sessionConfig = weekConfig?.find(c => c.label === session.session_label);
  if (!sessionConfig) notFound();

  const totalBlockTemplates = weekConfig.reduce((sum, s) => sum + s.templates.length, 0);

  // ── macrocycle + current phase ────────────────────────────

  const { data: blockRow } = await supabase
    .from('testing_blocks')
    .select('id, macrocycle_id')
    .eq('id', session.testing_block_id)
    .eq('user_id', user.id)
    .single();

  if (!blockRow) notFound();

  const { data: macrocyclesRaw } = await supabase
    .from('macrocycles')
    .select('id, name, goal_event')
    .eq('id', blockRow.macrocycle_id)
    .single();

  const macrocycle = macrocyclesRaw ?? null;
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

  // ── test templates for this session ───────────────────────

  const { data: templatesRaw } = await supabase
    .from('test_templates')
    .select('id, name, category, metric_type, unit')
    .eq('user_id', user.id)
    .in('name', sessionConfig.templates);

  // Preserve config order
  const templates = (templatesRaw ?? []).sort(
    (a, b) =>
      sessionConfig.templates.indexOf(a.name) -
      sessionConfig.templates.indexOf(b.name)
  );

  const templateIds = templates.map(t => t.id);

  const sections: FormSection[] = templates.length > 0
    ? [{
        label:     session.session_type,
        templates: templates.map(t => ({
          id:          t.id,
          name:        t.name,
          metric_type: t.metric_type,
          unit:        t.unit,
        })),
      }]
    : [];

  // ── previous results (other blocks) ──────────────────────

  const { data: prevRaw } = await supabase
    .from('test_results')
    .select('test_template_id, result_value, created_at, test_templates(metric_type, unit)')
    .eq('user_id', user.id)
    .neq('testing_block_id', blockRow.id)
    .in('test_template_id', templateIds)
    .order('created_at', { ascending: false });

  const previousResults: Record<string, PrevResult> = {};
  for (const r of prevRaw ?? []) {
    if (previousResults[r.test_template_id]) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tt  = (r as any).test_templates;
    const tpl = Array.isArray(tt) ? tt[0] : tt;
    previousResults[r.test_template_id] = {
      result_value: r.result_value,
      metric_type:  tpl?.metric_type ?? 'numeric',
      unit:         tpl?.unit        ?? '',
    };
  }

  // ── current results (this session) ───────────────────────

  const { data: currentRaw } = await supabase
    .from('test_results')
    .select('test_template_id, result_value, notes, created_at, testing_session_id')
    .eq('user_id', user.id)
    .eq('testing_session_id', sessionId)
    .in('test_template_id', templateIds)
    .order('created_at', { ascending: false });

  const currentResults: Record<string, CurrentResult> = {};
  for (const r of currentRaw ?? []) {
    if (currentResults[r.test_template_id]) continue;
    currentResults[r.test_template_id] = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result_value: (r as any).result_value,
      notes:        r.notes ?? null,
    };
  }

  // ── render ────────────────────────────────────────────────

  const phaseTint = currentPhase
    ? (phaseTints[currentPhase.phase_type] ?? phaseTints.reset)
    : null;

  return (
    <div className="w-full max-w-[1120px] mx-auto px-5 pt-6 pb-8 sm:px-8 sm:pt-7 md:px-10 md:pt-8">

      {/* Back */}
      <Link
        href={`/tests/week-${weekNumber}`}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground/75 transition-colors mb-5"
      >
        <ChevronLeft className="h-3 w-3" />
        Week {weekNumber}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {session.session_label}
          </h1>
          <p className="text-sm text-muted-foreground/60 mt-0.5">
            {formatDate(session.date)}
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1 shrink-0">
          {currentPhase && phaseTint && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium lowercase tracking-wide ${phaseTint}`}>
              {currentPhase.phase_type}
            </span>
          )}
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium lowercase tracking-wide ${sessionStatusStyles[session.status] ?? sessionStatusStyles.planned}`}>
            {session.status}
          </span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-muted-foreground/50 mb-6">
        <span className="font-medium text-foreground/60">{templates.length} Tests</span>
        <span className="mx-1.5 text-muted-foreground/30">·</span>
        {formatLabel(session.session_type)}
      </p>

      {/* Form */}
      {sections.length > 0 ? (
        <ResultForm
          testingBlockId={blockRow.id}
          testingSessionId={sessionId}
          macrocycleId={macrocycle.id}
          phaseId={currentPhase?.id ?? null}
          totalBlockTemplates={totalBlockTemplates}
          sections={sections}
          previousResults={previousResults}
          currentResults={currentResults}
        />
      ) : (
        <p className="text-sm text-muted-foreground/50">
          No test templates found. Ensure templates are configured in Libraries.
        </p>
      )}

    </div>
  );
}
