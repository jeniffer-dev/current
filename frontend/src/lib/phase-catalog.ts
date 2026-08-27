// Phase vocabulary, shared by the macrocycle timeline, the phase rows and
// the builder. Kept here so the colour maps exist once rather than being
// re-typed in each component that needs them.

export type PhaseType =
  | 'adaptation'
  | 'accumulation'
  | 'transmutation'
  | 'realization'
  | 'competition'
  | 'reset'
  | 'custom';

// Solid fills — timeline bars, dots, legends.
export const phaseColors: Record<string, string> = {
  adaptation:    'var(--current-soft)',
  accumulation:  'var(--current-load)',
  transmutation: 'var(--current-peak)',
  realization:   'var(--current-recovery)',
  competition:   'var(--current-primary)',
  reset:         '#e5e7eb',
  custom:        '#b8c4cc',
};

export function phaseColor(phaseType: string): string {
  return phaseColors[phaseType] ?? phaseColors.reset;
}

// Tinted badges — the phase-type pill on a phase card.
export const phaseTints: Record<string, string> = {
  adaptation:    'bg-teal-50 text-teal-700',
  accumulation:  'bg-orange-50 text-orange-700',
  transmutation: 'bg-amber-50 text-amber-700',
  realization:   'bg-yellow-50 text-yellow-700',
  competition:   'bg-emerald-50 text-emerald-700',
  reset:         'bg-slate-50 text-slate-500',
  custom:        'bg-slate-50 text-slate-600',
};

export function phaseTint(phaseType: string): string {
  return phaseTints[phaseType] ?? phaseTints.reset;
}

// The sequence offered as a starting point when building a macrocycle.
// It is a suggestion, not a constraint: an athlete may drop any of these,
// repeat one, reorder them, or add phases of their own. A long season
// commonly runs Transmutation → Realization more than once.
export type SuggestedPhase = {
  type:  PhaseType;
  name:  string;
  note:  string;
  weeks: number;
};

export const suggestedPhases: SuggestedPhase[] = [
  { type: 'adaptation',    name: 'Adaptation',    note: 'Base aerobic work and technique', weeks: 4 },
  { type: 'accumulation',  name: 'Accumulation',  note: 'Volume goes up',                  weeks: 6 },
  { type: 'transmutation', name: 'Transmutation', note: 'Starts to look like competition', weeks: 4 },
  { type: 'realization',   name: 'Realization',   note: 'Fine-tuning before it counts',    weeks: 3 },
  { type: 'competition',   name: 'Competition',   note: 'Peak performance',                weeks: 2 },
  { type: 'reset',         name: 'Transition',    note: 'Active rest',                     weeks: 2 },
];

export function suggestedPhase(type: PhaseType): SuggestedPhase | undefined {
  return suggestedPhases.find(p => p.type === type);
}
