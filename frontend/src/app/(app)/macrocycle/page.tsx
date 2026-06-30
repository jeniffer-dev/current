import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { MacrocycleTimeline } from '@/features/macrocycle/macrocycle-timeline';
import { PhaseRow } from '@/features/macrocycle/phase-row';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('macrocycles')
    .select('name')
    .order('start_date', { ascending: false })
    .limit(1)
    .single();
  return { title: `${data?.name ?? 'CURRENT'} · CURRENT` };
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
  const today = new Date().toISOString().split('T')[0];

  const { data: macrocycles } = await supabase
    .from('macrocycles')
    .select('id, name, goal_event, start_date, end_date')
    .order('start_date', { ascending: false })
    .limit(1);

  const macrocycle: Macrocycle | null = macrocycles?.[0] ?? null;

  let phases: Phase[] = [];
  if (macrocycle) {
    const { data } = await supabase
      .from('phases')
      .select('id, name, phase_type, start_date, end_date, volume, intensity, notes')
      .eq('macrocycle_id', macrocycle.id)
      .order('start_date', { ascending: true });
    phases = (data ?? []) as Phase[];
  }

  return (
    <div className="w-full max-w-[1120px] mx-auto px-5 pt-6 pb-8 sm:px-8 sm:pt-7 md:px-10 md:pt-8 space-y-4">

      <div className="mb-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {macrocycle?.name ?? '—'}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Preparation roadmap</p>
      </div>

      {macrocycle && phases.length > 0 && (
        <MacrocycleTimeline macrocycle={macrocycle} phases={phases} today={today} />
      )}

      {phases.length > 0 ? (
        <div className="space-y-3">
          {phases.map(phase => (
            <PhaseRow key={phase.id} phase={phase} today={today} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">No phases defined yet.</p>
        </div>
      )}
    </div>
  );
}
