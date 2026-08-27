import { suggestedPhases, type PhaseType } from '@/lib/phase-catalog';

export type BuilderPhase = {
  uid:         string;
  type:        PhaseType;
  /** Only set for custom phases; known types take their name from the catalog. */
  label:       string;
  description: string;
  weeks:       number;
  included:    boolean;
};

export type BuilderState = {
  step:            0 | 1;
  name:            string;
  goalEvent:       string;
  startDate:       string;
  targetDate:      string;
  phases:          BuilderPhase[];
  nextUid:         number;
  addingPhase:     boolean;
  customPhaseName: string;
};

export type BuilderAction =
  | { type: 'setField'; field: 'name' | 'goalEvent' | 'startDate' | 'targetDate' | 'customPhaseName'; value: string }
  | { type: 'step'; step: 0 | 1 }
  | { type: 'togglePhase'; uid: string }
  | { type: 'setWeeks'; uid: string; delta: number }
  | { type: 'setDescription'; uid: string; value: string }
  | { type: 'removePhase'; uid: string }
  | { type: 'addPhase'; phaseType: PhaseType }
  | { type: 'addCustomPhase' }
  | { type: 'toggleAdding' };

export function initialBuilderState(today: string): BuilderState {
  return {
    step:            0,
    name:            '',
    goalEvent:       '',
    startDate:       today,
    targetDate:      '',
    phases:          suggestedPhases.map((p, i) => ({
      uid: `p${i}`, type: p.type, label: '', description: '', weeks: p.weeks, included: true,
    })),
    nextUid:         suggestedPhases.length,
    addingPhase:     false,
    customPhaseName: '',
  };
}

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'setField':
      return { ...state, [action.field]: action.value };

    case 'step':
      return { ...state, step: action.step };

    case 'togglePhase':
      return {
        ...state,
        phases: state.phases.map(p =>
          p.uid === action.uid ? { ...p, included: !p.included } : p),
      };

    case 'setWeeks':
      return {
        ...state,
        phases: state.phases.map(p =>
          p.uid === action.uid
            ? { ...p, weeks: Math.min(52, Math.max(1, p.weeks + action.delta)) }
            : p),
      };

    case 'setDescription':
      return {
        ...state,
        phases: state.phases.map(p =>
          p.uid === action.uid ? { ...p, description: action.value } : p),
      };

    case 'removePhase':
      return { ...state, phases: state.phases.filter(p => p.uid !== action.uid) };

    case 'addPhase': {
      const suggested = suggestedPhases.find(p => p.type === action.phaseType);
      if (!suggested) return state;
      return {
        ...state,
        phases: [...state.phases, {
          uid: `p${state.nextUid}`, type: suggested.type, label: '',
          description: '', weeks: suggested.weeks, included: true,
        }],
        nextUid:     state.nextUid + 1,
        addingPhase: false,
      };
    }

    case 'addCustomPhase': {
      const label = state.customPhaseName.trim();
      if (!label) return state;
      return {
        ...state,
        phases: [...state.phases, {
          uid: `p${state.nextUid}`, type: 'custom', label,
          description: '', weeks: 4, included: true,
        }],
        nextUid:         state.nextUid + 1,
        addingPhase:     false,
        customPhaseName: '',
      };
    }

    case 'toggleAdding':
      return { ...state, addingPhase: !state.addingPhase, customPhaseName: '' };
  }
}

// ── derived ───────────────────────────────────────────────────

export function includedPhases(state: BuilderState): BuilderPhase[] {
  return state.phases.filter(p => p.included);
}

export function phaseName(phase: BuilderPhase): string {
  if (phase.type === 'custom') return phase.label || 'Custom phase';
  return suggestedPhases.find(p => p.type === phase.type)?.name ?? phase.type;
}

export function phaseNote(phase: BuilderPhase): string {
  if (phase.type === 'custom') return phase.description || 'Your own phase';
  return suggestedPhases.find(p => p.type === phase.type)?.note ?? '';
}

/**
 * What's still missing before the Goal step can be left, and which field
 * to send the athlete to. Carrying the field id matters as much as the
 * message: the form has two name fields side by side, and being told
 * "give your plan a name" while looking at a filled-in Event name is how
 * someone concludes the app is broken.
 */
export type GoalBlocker = { message: string; fieldId: string };

export function goalStepBlocker(state: BuilderState): GoalBlocker | null {
  if (!state.name.trim()) {
    return { message: 'Your plan needs a name — the first field.', fieldId: 'mc-name' };
  }
  if (!state.startDate) {
    return { message: 'Pick a start date.', fieldId: 'mc-start' };
  }
  if (!state.targetDate) {
    return { message: 'Pick the date of your target event.', fieldId: 'mc-target' };
  }
  if (state.targetDate <= state.startDate) {
    return { message: 'The event has to come after the start date.', fieldId: 'mc-target' };
  }
  return null;
}

export function canContinueFromGoal(state: BuilderState): boolean {
  return goalStepBlocker(state) === null;
}
