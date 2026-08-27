import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { getMacrocycles } from '@/lib/macrocycle';
import { todayInTimezone } from '@/lib/today';
import { MacrocycleTimeline } from '@/features/macrocycle/macrocycle-timeline';
import { PhaseRow } from '@/features/macrocycle/phase-row';
import { PlanList } from '@/features/macrocycle/plan-list';
import type { PhasePrescription } from '@/features/macrocycle/phase-session-mix';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const today = todayInTimezone(cookieStore.get('tz')?.value);
  const { scope } = await getMacrocycles<{ name: string; start_date: string; end_date: string }>(
    supabase, today, 'name, start_date, end_date');
  return { title: `${scope?.name ?? 'CURRENT'} · CURRENT` };
}

export type Phase = {
  id: string;
  name: string;
  phase_type: string;
  start_date: string;
  end_date: string;
  volume: string | null;
  intensity: string | null;
  notes: string | null;
};

export type Macrocycle = {
  id: string;
  name: string;
  goal_event: string | null;
  start_date: string;
  end_date: string;
};

export default async function MacrocyclePage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const today = todayInTimezone(cookieStore.get('tz')?.value);

  const plans = await getMacrocycles<Macrocycle>(
    supabase, today, 'id, name, goal_event, start_date, end_date');
  const macrocycle = plans.scope;

  let phases: Phase[] = [];
  // The typical week of each phase, and how many weeks depart from it.
  const mixByPhase   = new Map<string, PhasePrescription[]>();
  const editedWeeks  = new Map<string, number>();

  if (macrocycle) {
    const { data } = await supabase
      .from('phases')
      .select('id, name, phase_type, start_date, end_date, volume, intensity, notes')
      .eq('macrocycle_id', macrocycle.id)
      .order('start_date', { ascending: true });
    phases = (data ?? []) as Phase[];

    const phaseIds = phases.map(p => p.id);
    if (phaseIds.length > 0) {
      const [{ data: mix }, { data: weeks }] = await Promise.all([
        supabase
          .from('phase_session_prescriptions')
          .select('phase_id, activity_key, label, sessions_per_week')
          .in('phase_id', phaseIds),
        supabase
          .from('phase_week_prescriptions')
          .select('phase_id, week_index')
          .in('phase_id', phaseIds),
      ]);

      for (const row of mix ?? []) {
        const list = mixByPhase.get(row.phase_id) ?? [];
        list.push(row);
        mixByPhase.set(row.phase_id, list);
      }

      // A week is one departure however many activities it changes, so
      // the weeks are counted distinctly rather than the rows.
      const seen = new Map<string, Set<number>>();
      for (const row of weeks ?? []) {
        const set = seen.get(row.phase_id) ?? new Set<number>();
        set.add(row.week_index);
        seen.set(row.phase_id, set);
      }
      for (const [phaseId, set] of seen) editedWeeks.set(phaseId, set.size);
    }
  }

  // Other cycles, split by where today falls. Nothing is archived by hand:
  // a plan is upcoming until its start date, and past after its end.
  const upcoming = plans.all.filter(p => p.start_date > today).reverse();
  const past     = plans.all.filter(p => p.end_date < today).reverse();

  return (
    <div className="w-full max-w-[1120px] mx-auto px-5 pt-6 pb-8 sm:px-8 sm:pt-7 md:px-10 md:pt-8 space-y-4">

      <div className="mb-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {macrocycle?.name ?? 'No plan yet'}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Preparation roadmap</p>
        </div>
        {macrocycle && (
          <Button asChild variant="outline" size="sm" className="mt-1 shrink-0">
            <Link href="/macrocycle/new">New plan</Link>
          </Button>
        )}
      </div>

      {macrocycle && phases.length > 0 && (
        <MacrocycleTimeline macrocycle={macrocycle} phases={phases} today={today} />
      )}

      {phases.length > 0 ? (
        <div className="space-y-3">
          {phases.map(phase => (
            <PhaseRow
              key={phase.id}
              phase={phase}
              today={today}
              prescriptions={mixByPhase.get(phase.id) ?? []}
              editedWeeks={editedWeeks.get(phase.id) ?? 0}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {macrocycle
              ? 'No phases defined yet.'
              : 'Nothing planned yet. Build a macrocycle to map out your season.'}
          </p>
          <Button asChild>
            <Link href="/macrocycle/new">
              {macrocycle ? 'Build a new plan' : 'Build your plan'}
            </Link>
          </Button>
        </div>
      )}

      <PlanList plans={upcoming} kind="upcoming" today={today} />
      <PlanList plans={past} kind="past" today={today} />
    </div>
  );
}
