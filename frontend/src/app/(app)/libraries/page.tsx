import { Dumbbell, Layers, Waves, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { LibraryContent } from '@/features/libraries/library-content';
import type { GymTemplate } from '@/features/libraries/library-content';

export default async function LibrariesPage() {
  const supabase = await createClient();

  const [
    { data: exercises, count: exerciseCount },
    { data: gymRaw, count: gymCount },
    { data: swimTemplates, count: swimCount },
    { data: testTemplates, count: testCount },
  ] = await Promise.all([
    supabase
      .from('exercises')
      .select('id, name, category, movement_pattern, main_muscle', { count: 'exact' })
      .order('name'),
    supabase
      .from('gym_session_templates')
      .select('id, name, phase_type, focus, gym_session_exercises(id)', { count: 'exact' })
      .order('name'),
    supabase
      .from('swim_session_templates')
      .select('id, name, swim_type, distance_meters', { count: 'exact' })
      .order('name'),
    supabase
      .from('test_templates')
      .select('id, name, category, protocol', { count: 'exact' })
      .order('name'),
  ]);

  // Normalise nested exercises array (Supabase returns array for nested selects)
  const gymTemplates: GymTemplate[] = (gymRaw ?? []).map(t => ({
    id: t.id,
    name: t.name,
    phase_type: t.phase_type ?? null,
    focus: t.focus ?? null,
    gym_session_exercises: Array.isArray(t.gym_session_exercises)
      ? (t.gym_session_exercises as { id: string }[])
      : [],
  }));

  const overviewCards = [
    { label: 'Exercises',      descriptor: 'Movement Library',       count: exerciseCount ?? 0, Icon: Dumbbell,     comingSoon: false },
    { label: 'Gym Templates',  descriptor: 'Strength Sessions',      count: gymCount ?? 0,      Icon: Layers,       comingSoon: false },
    { label: 'Swim Templates', descriptor: 'Pool Sessions',          count: swimCount ?? 0,     Icon: Waves,        comingSoon: false },
    { label: 'Tests',          descriptor: 'Performance Benchmarks', count: testCount ?? 0,     Icon: ClipboardList, comingSoon: false },
  ];

  return (
    <div className="w-full max-w-[1120px] mx-auto px-5 pt-6 pb-8 sm:px-8 sm:pt-7 md:px-10 md:pt-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Libraries</h1>
        <p className="text-sm text-muted-foreground/60 mt-0.5">Training Building Blocks</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {overviewCards.map(({ label, descriptor, count, Icon, comingSoon }) => (
          <Card key={label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground/45">{label}</p>
                <Icon className="h-4 w-4 text-muted-foreground/25 shrink-0" />
              </div>
              {comingSoon ? (
                <p className="text-sm font-medium text-muted-foreground/45 leading-none">Coming Soon</p>
              ) : (
                <p className="text-3xl font-bold tabular-nums tracking-tight leading-none">{count}</p>
              )}
              <p className="text-xs text-muted-foreground/40 mt-2">{descriptor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Library tabs */}
      <LibraryContent
        exercises={exercises ?? []}
        gymTemplates={gymTemplates}
        swimTemplates={swimTemplates ?? []}
        testTemplates={testTemplates ?? []}
      />

    </div>
  );
}
