'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

// ── types ─────────────────────────────────────────────────────

export type Exercise = {
  id: string;
  name: string;
  category: string | null;
  movement_pattern: string | null;
  main_muscle: string | null;
};

export type GymTemplate = {
  id: string;
  name: string;
  phase_type: string | null;
  focus: string | null;
  gym_session_exercises: { id: string }[];
};

export type SwimTemplate = {
  id: string;
  name: string;
  swim_type: string;
  distance_meters: number | null;
};

export type TestTemplate = {
  id: string;
  name: string;
  category: string | null;
  protocol: string | null;
};

// ── mappings ──────────────────────────────────────────────────

const phaseLabels: Record<string, string> = {
  adaptation:    'Adaptation',
  accumulation:  'Accumulation',
  transmutation: 'Transmutation',
  realization:   'Realization',
  competition:   'Competition',
};

const phaseTints: Record<string, string> = {
  adaptation:    'bg-teal-50 text-teal-700',
  accumulation:  'bg-orange-50 text-orange-700',
  transmutation: 'bg-amber-50 text-amber-700',
  realization:   'bg-yellow-50 text-yellow-700',
  competition:   'bg-emerald-50 text-emerald-700',
};

const phaseOrder = ['adaptation', 'accumulation', 'transmutation', 'realization', 'competition'];

const swimTypeLabels: Record<string, string> = {
  endurance: 'Endurance',
  anaerobic: 'Anaerobic',
  alactic:   'Alactic',
  recovery:  'Recovery',
  technique: 'Technique',
};

const swimTypeTints: Record<string, string> = {
  endurance: 'bg-teal-50 text-teal-700',
  anaerobic: 'bg-orange-50 text-orange-700',
  alactic:   'bg-amber-50 text-amber-700',
  recovery:  'bg-slate-50 text-slate-500',
  technique: 'bg-sky-50 text-sky-700',
};

const swimTypeFocus: Record<string, string> = {
  endurance: 'Aerobic Capacity',
  anaerobic: 'Anaerobic Capacity',
  alactic:   'Speed & Power',
  recovery:  'Active Recovery',
  technique: 'Technical Refinement',
};

// Category filter pills for exercises
const EXERCISE_CATEGORIES = ['All', 'Strength', 'Mobility', 'Activation', 'Core', 'Prehab'];

// Display purposes per gym template (name → purpose)
const GYM_TEMPLATE_PURPOSES: Record<string, string> = {
  'ADP – Day 1':       'Full Body Adaptation',
  'ADP – Day 2':       'Upper / Lower Foundation',
  'ADP – Day 3':       'Glute Strength & Stability',
  'ACC – Day 1':       'Lower Body Strength',
  'ACC – Day 2':       'Upper Body Strength',
  'ACC – Day 3':       'Lower Body Hypertrophy',
  'ACC – Day 4 Glutes':'Glute & Hip Development',
  'TRN – Day 1':       'Strength Expression',
  'TRN – Day 2':       'Power Development',
  'TRN – Day 3':       'Posterior Chain',
  'RLZ – Day 1':       'Peak Strength',
  'RLZ – Day 2':       'Power & Speed',
};

// Coming-soon test examples
const FUTURE_TESTS = [
  'Strength Benchmarks',
  'Swim Capacity Tests',
  'Power Development',
  'Competition Readiness',
];

// ── group helpers ─────────────────────────────────────────────

function groupByPhaseType(templates: GymTemplate[]): { phase: string; items: GymTemplate[] }[] {
  const map = new Map<string, GymTemplate[]>();
  for (const t of templates) {
    const key = t.phase_type ?? 'other';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => {
      const ai = phaseOrder.indexOf(a);
      const bi = phaseOrder.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    })
    .map(([phase, items]) => ({ phase, items }));
}

function groupBySwimType(templates: SwimTemplate[]): { type: string; items: SwimTemplate[] }[] {
  const map = new Map<string, SwimTemplate[]>();
  for (const t of templates) {
    if (!map.has(t.swim_type)) map.set(t.swim_type, []);
    map.get(t.swim_type)!.push(t);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, items]) => ({ type, items }));
}

function avgDistance(items: SwimTemplate[]): number | null {
  const withDist = items.filter(t => t.distance_meters);
  if (!withDist.length) return null;
  return Math.round(withDist.reduce((s, t) => s + (t.distance_meters ?? 0), 0) / withDist.length);
}

// ── component ─────────────────────────────────────────────────

export function LibraryContent({
  exercises,
  gymTemplates,
  swimTemplates,
  testTemplates,
}: {
  exercises: Exercise[];
  gymTemplates: GymTemplate[];
  swimTemplates: SwimTemplate[];
  testTemplates: TestTemplate[];
}) {
  const [activeCategory, setActiveCategory] = useState('All');

  const gymGroups  = groupByPhaseType(gymTemplates);
  const swimGroups = groupBySwimType(swimTemplates);

  const filteredExercises = activeCategory === 'All'
    ? exercises
    : exercises.filter(ex => ex.category?.toLowerCase() === activeCategory.toLowerCase());

  const categoryCounts = EXERCISE_CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = cat === 'All'
      ? exercises.length
      : exercises.filter(ex => ex.category?.toLowerCase() === cat.toLowerCase()).length;
    return acc;
  }, {});

  return (
    <Tabs defaultValue="exercises">
      <TabsList className="mb-4">
        <TabsTrigger value="exercises">Exercises</TabsTrigger>
        <TabsTrigger value="gym-templates">Gym Templates</TabsTrigger>
        <TabsTrigger value="swim-templates">Swim Templates</TabsTrigger>
        <TabsTrigger value="tests">Tests</TabsTrigger>
      </TabsList>

      {/* ── Exercises ── */}
      <TabsContent value="exercises">
        <Card>
          <CardContent className="p-0">
            {exercises.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm font-medium text-muted-foreground/60">No exercises configured yet.</p>
                <p className="text-xs text-muted-foreground/40 mt-1">Exercises will appear here once added to the library.</p>
              </div>
            ) : (
              <>
                {/* Category filter pills */}
                <div className="flex flex-wrap gap-2 px-6 py-4 border-b border-border/50">
                  {EXERCISE_CATEGORIES.map(cat => {
                    const count = categoryCounts[cat] ?? 0;
                    const label = cat === 'All' ? 'All' : `${cat} (${count})`;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          activeCategory === cat
                            ? 'bg-foreground text-background'
                            : 'bg-muted text-muted-foreground/70 hover:bg-muted/80'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Exercise list */}
                {filteredExercises.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-muted-foreground/50">No exercises in this category.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {filteredExercises.map(ex => {
                      const meta = [ex.movement_pattern, ex.main_muscle].filter(Boolean).join(' · ');
                      return (
                        <div key={ex.id} className="px-6 py-4 hover:bg-muted/40 transition-colors">
                          <p className="text-sm font-medium">{ex.name}</p>
                          {meta && (
                            <p className="text-xs text-muted-foreground/55 mt-0.5">{meta}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Gym Templates ── */}
      <TabsContent value="gym-templates">
        <Card>
          <CardContent className="p-0">
            {gymTemplates.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm font-medium text-muted-foreground/60">No gym templates configured yet.</p>
                <p className="text-xs text-muted-foreground/40 mt-1">Session templates will appear here once created.</p>
              </div>
            ) : (
              <div>
                {gymGroups.map((group, groupIndex) => (
                  <div key={group.phase}>
                    {groupIndex > 0 && <div className="border-t border-border/60" />}

                    {/* Group header */}
                    <div className="px-6 pt-5 pb-3 flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${phaseTints[group.phase] ?? 'bg-slate-50 text-slate-500'}`}>
                        {phaseLabels[group.phase] ?? group.phase}
                      </span>
                      <span className="text-xs text-muted-foreground/40">
                        {group.items.length} {group.items.length === 1 ? 'template' : 'templates'}
                      </span>
                    </div>

                    {/* Templates */}
                    <div className="divide-y divide-border/30">
                      {group.items.map(t => {
                        const exCount = t.gym_session_exercises.length;
                        const purpose = GYM_TEMPLATE_PURPOSES[t.name] ?? t.focus ?? null;
                        return (
                          <div key={t.id} className="px-6 py-3.5 hover:bg-muted/40 transition-colors">
                            <p className="text-sm font-medium">{t.name}</p>
                            {purpose && (
                              <p className="text-xs text-muted-foreground/65 mt-0.5">{purpose}</p>
                            )}
                            {exCount > 0 && (
                              <p className="text-xs text-muted-foreground/40 mt-0.5">{exCount} exercises</p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="h-3" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Swim Templates ── */}
      <TabsContent value="swim-templates">
        <Card>
          <CardContent className="p-0">
            {swimTemplates.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm font-medium text-muted-foreground/60">No swim templates configured yet.</p>
                <p className="text-xs text-muted-foreground/40 mt-1">Swim session templates will appear here once created.</p>
              </div>
            ) : (
              <div>
                {swimGroups.map((group, groupIndex) => {
                  const avg = avgDistance(group.items);
                  const focus = swimTypeFocus[group.type] ?? null;
                  return (
                    <div key={group.type}>
                      {groupIndex > 0 && <div className="border-t border-border/60" />}

                      <div className="px-6 py-5 hover:bg-muted/40 transition-colors">
                        {/* Type badge */}
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${swimTypeTints[group.type] ?? swimTypeTints.endurance}`}>
                            {swimTypeLabels[group.type] ?? group.type}
                          </span>
                        </div>

                        {/* Focus description */}
                        {focus && (
                          <p className="text-sm font-medium text-foreground/75 mb-1">{focus}</p>
                        )}

                        {/* Stats */}
                        <p className="text-xs text-muted-foreground/50">
                          {group.items.length} {group.items.length === 1 ? 'template' : 'templates'}
                          {avg ? `  ·  ${avg.toLocaleString()} m avg` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Tests ── */}
      <TabsContent value="tests">
        <Card>
          <CardContent className="p-0">
            {testTemplates.length === 0 ? (
              <div className="px-6 py-10">
                <p className="text-sm font-semibold text-foreground/65 mb-1.5">Performance Testing</p>
                <p className="text-xs text-muted-foreground/55 leading-relaxed mb-6">
                  Testing protocols will be introduced in a future release.
                </p>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/35 mb-3">
                  Coming Soon
                </p>
                <div className="space-y-2">
                  {FUTURE_TESTS.map(item => (
                    <p key={item} className="text-xs text-muted-foreground/40">— {item}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {testTemplates.map(t => (
                  <div key={t.id} className="px-6 py-4">
                    <p className="text-sm font-medium">{t.name}</p>
                    {t.category && (
                      <p className="text-xs text-muted-foreground/55 mt-0.5 capitalize">{t.category}</p>
                    )}
                    {t.protocol && (
                      <p className="text-xs text-muted-foreground/40 mt-0.5">{t.protocol}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

    </Tabs>
  );
}
