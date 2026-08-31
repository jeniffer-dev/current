import { suggestedPhases, type PhaseType } from '@/lib/phase-catalog';
import {
  activities,
  defaultMix,
  deloadCount,
  type ActivityKey,
} from '@/lib/session-catalog';

export type BuilderPhase = {
  uid:         string;
  type:        PhaseType;
  /** Only set for custom phases; known types take their name from the catalog. */
  label:       string;
  description: string;
  weeks:       number;
  included:    boolean;
};

/** One activity's place in a phase's typical week. */
export type ActivityPlan = { included: boolean; freq: number };

export type SessionPlan = {
  /** Dense over the catalog, so an excluded activity remembers its count. */
  activities: Record<ActivityKey, ActivityPlan>;
  /**
   * Sparse: only the weeks that step away from the typical one. Absence
   * means "the typical week applies", which is most weeks and should
   * cost nothing to say.
   */
  overrides:  Record<number, Record<ActivityKey, number>>;
  /** What the athlete calls their "Other" slot, if they named it. */
  otherLabel: string;
};

/**
 * When a battery happens. A phase anchor is held by phase UID, not by
 * database id: the plan does not exist yet, so the phases it points at
 * have no ids until it is created.
 */
export type BuilderAnchor =
  | { kind: 'phase'; phaseUid: string; position: 'start' | 'end' }
  | { kind: 'date';  date: string };

export type BatteryKind = 'in_water' | 'strength' | 'mixed';

export type BuilderBattery = {
  uid:         string;
  name:        string;
  kind:        BatteryKind;
  templateIds: string[];
  anchors:     BuilderAnchor[];
};

/** A test the athlete already has in their library. */
export type TestTemplate = {
  id:          string;
  name:        string;
  category:    string;
  metric_type: string;
  unit:        string | null;
};

export type BuilderState = {
  step:            0 | 1 | 2 | 3;
  name:            string;
  goalEvent:       string;
  startDate:       string;
  targetDate:      string;
  phases:          BuilderPhase[];
  nextUid:         number;
  addingPhase:     boolean;
  customPhaseName: string;
  /**
   * Keyed by phase uid, and only for phases the athlete actually edited —
   * everything else falls back to the default mix for its phase type. A
   * plan the athlete never opened is not a plan they made.
   */
  sessionPlans:    Record<string, SessionPlan>;
  activePhaseUid:  string | null;
  /** Which week of the active phase is open for editing, if any. */
  activeWeek:      number | null;
  /** The athlete's test library, loaded on the server. Never edited here. */
  templates:       TestTemplate[];
  batteries:       BuilderBattery[];
  nextBatteryUid:  number;
  activeBatteryUid: string | null;
};

export type BuilderAction =
  | { type: 'setField'; field: 'name' | 'goalEvent' | 'startDate' | 'targetDate' | 'customPhaseName'; value: string }
  | { type: 'step'; step: 0 | 1 | 2 | 3 }
  | { type: 'togglePhase'; uid: string }
  | { type: 'setWeeks'; uid: string; delta: number }
  | { type: 'setDescription'; uid: string; value: string }
  | { type: 'removePhase'; uid: string }
  | { type: 'addPhase'; phaseType: PhaseType }
  | { type: 'addCustomPhase' }
  | { type: 'toggleAdding' }
  | { type: 'selectPhase'; uid: string }
  | { type: 'selectWeek'; week: number | null }
  | { type: 'toggleActivity'; uid: string; key: ActivityKey }
  | { type: 'setFreq'; uid: string; key: ActivityKey; delta: number }
  | { type: 'setOtherLabel'; uid: string; value: string }
  | { type: 'adjustWeek'; uid: string; week: number; key: ActivityKey; delta: number }
  | { type: 'deloadWeek'; uid: string; week: number }
  | { type: 'resetWeek'; uid: string; week: number }
  | { type: 'addBattery'; kind: BatteryKind }
  | { type: 'removeBattery'; uid: string }
  | { type: 'selectBattery'; uid: string }
  | { type: 'setBatteryName'; uid: string; value: string }
  | { type: 'toggleTemplate'; uid: string; templateId: string }
  | { type: 'togglePhaseAnchor'; uid: string; phaseUid: string; position: 'start' | 'end' }
  | { type: 'addDateAnchor'; uid: string; date: string }
  | { type: 'removeDateAnchor'; uid: string; date: string };

const kindLabels: Record<BatteryKind, string> = {
  in_water: 'Water testing',
  strength: 'Gym testing',
  mixed:    'Testing',
};

export function batteryKindLabel(kind: BatteryKind): string {
  return kindLabels[kind];
}

/**
 * A battery per kind of test the athlete actually owns. Suggesting a
 * water battery to someone with no water tests would be inventing a plan
 * for them; the library is what they have said they measure.
 */
function suggestedBatteries(templates: TestTemplate[]): BuilderBattery[] {
  const kinds: BatteryKind[] = ['in_water', 'strength'];
  return kinds
    .filter(kind => templates.some(t => t.category === kind))
    .map((kind, i) => ({
      uid:         `b${i}`,
      name:        kindLabels[kind],
      kind,
      templateIds: templates.filter(t => t.category === kind).map(t => t.id),
      anchors:     [],
    }));
}

export function initialBuilderState(
  { today, templates }: { today: string; templates: TestTemplate[] },
): BuilderState {
  const batteries = suggestedBatteries(templates);
  return {
    step:             0,
    name:             '',
    goalEvent:        '',
    startDate:        today,
    targetDate:       '',
    phases:           suggestedPhases.map((p, i) => ({
      uid: `p${i}`, type: p.type, label: '', description: '', weeks: p.weeks, included: true,
    })),
    nextUid:          suggestedPhases.length,
    addingPhase:      false,
    customPhaseName:  '',
    sessionPlans:     {},
    activePhaseUid:   null,
    activeWeek:       null,
    templates,
    batteries,
    nextBatteryUid:   batteries.length,
    activeBatteryUid: batteries[0]?.uid ?? null,
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

    case 'setWeeks': {
      const phase = state.phases.find(p => p.uid === action.uid);
      if (!phase) return state;
      const weeks = Math.min(52, Math.max(1, phase.weeks + action.delta));
      if (weeks === phase.weeks) return state;

      // Shortening a phase drops the week edits that no longer have a week.
      // Keeping them would silently resurrect them if the phase grew back,
      // attached to a week the athlete never looked at.
      const plan = state.sessionPlans[action.uid];
      const sessionPlans = plan
        ? { ...state.sessionPlans, [action.uid]: { ...plan, overrides: pruneOverrides(plan.overrides, weeks) } }
        : state.sessionPlans;

      return {
        ...state,
        phases: state.phases.map(p => (p.uid === action.uid ? { ...p, weeks } : p)),
        sessionPlans,
        activeWeek: state.activeWeek !== null && state.activeWeek >= weeks ? null : state.activeWeek,
      };
    }

    case 'setDescription':
      return {
        ...state,
        phases: state.phases.map(p =>
          p.uid === action.uid ? { ...p, description: action.value } : p),
      };

    case 'removePhase': {
      const sessionPlans = { ...state.sessionPlans };
      delete sessionPlans[action.uid];
      return {
        ...state,
        phases: state.phases.filter(p => p.uid !== action.uid),
        sessionPlans,
        activePhaseUid: state.activePhaseUid === action.uid ? null : state.activePhaseUid,
      };
    }

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

    case 'selectPhase':
      return {
        ...state,
        activePhaseUid: state.activePhaseUid === action.uid ? null : action.uid,
        activeWeek:     null,
      };

    case 'selectWeek':
      return { ...state, activeWeek: state.activeWeek === action.week ? null : action.week };

    case 'toggleActivity':
      return editPlan(state, action.uid, plan => ({
        ...plan,
        activities: {
          ...plan.activities,
          [action.key]: {
            ...plan.activities[action.key],
            included: !plan.activities[action.key].included,
          },
        },
      }));

    case 'setFreq':
      return editPlan(state, action.uid, plan => ({
        ...plan,
        activities: {
          ...plan.activities,
          [action.key]: {
            ...plan.activities[action.key],
            freq: clampCount(plan.activities[action.key].freq + action.delta, 1),
          },
        },
      }));

    case 'setOtherLabel':
      return editPlan(state, action.uid, plan => ({ ...plan, otherLabel: action.value }));

    case 'adjustWeek':
      return editPlan(state, action.uid, plan => {
        const week = effectiveWeek(plan, action.week);
        return {
          ...plan,
          overrides: {
            ...plan.overrides,
            [action.week]: { ...week, [action.key]: clampCount(week[action.key] + action.delta, 0) },
          },
        };
      });

    case 'deloadWeek':
      return editPlan(state, action.uid, plan => {
        const week = effectiveWeek(plan, action.week);
        const next = {} as Record<ActivityKey, number>;
        for (const a of activities) next[a.key] = deloadCount(week[a.key]);
        return { ...plan, overrides: { ...plan.overrides, [action.week]: next } };
      });

    case 'resetWeek':
      return editPlan(state, action.uid, plan => {
        const overrides = { ...plan.overrides };
        delete overrides[action.week];
        return { ...plan, overrides };
      });

    case 'addBattery': {
      const uid = `b${state.nextBatteryUid}`;
      return {
        ...state,
        batteries: [...state.batteries, {
          uid, name: kindLabels[action.kind], kind: action.kind,
          templateIds: state.templates.filter(t => t.category === action.kind).map(t => t.id),
          anchors: [],
        }],
        nextBatteryUid:   state.nextBatteryUid + 1,
        activeBatteryUid: uid,
      };
    }

    case 'removeBattery': {
      const batteries = state.batteries.filter(b => b.uid !== action.uid);
      return {
        ...state,
        batteries,
        activeBatteryUid:
          state.activeBatteryUid === action.uid ? (batteries[0]?.uid ?? null) : state.activeBatteryUid,
      };
    }

    case 'selectBattery':
      return { ...state, activeBatteryUid: action.uid };

    case 'setBatteryName':
      return editBattery(state, action.uid, b => ({ ...b, name: action.value }));

    case 'toggleTemplate':
      return editBattery(state, action.uid, b => ({
        ...b,
        templateIds: b.templateIds.includes(action.templateId)
          ? b.templateIds.filter(id => id !== action.templateId)
          : [...b.templateIds, action.templateId],
      }));

    case 'togglePhaseAnchor':
      return editBattery(state, action.uid, b => {
        const has = hasPhaseAnchor(b, action.phaseUid, action.position);
        return {
          ...b,
          anchors: has
            ? b.anchors.filter(a =>
                !(a.kind === 'phase' && a.phaseUid === action.phaseUid && a.position === action.position))
            : [...b.anchors, { kind: 'phase', phaseUid: action.phaseUid, position: action.position }],
        };
      });

    case 'addDateAnchor':
      return editBattery(state, action.uid, b =>
        // A date already on the list is not a second sitting.
        b.anchors.some(a => a.kind === 'date' && a.date === action.date)
          ? b
          : { ...b, anchors: [...b.anchors, { kind: 'date', date: action.date }] });

    case 'removeDateAnchor':
      return editBattery(state, action.uid, b => ({
        ...b,
        anchors: b.anchors.filter(a => !(a.kind === 'date' && a.date === action.date)),
      }));
  }
}

// ── batteries ─────────────────────────────────────────────────

function editBattery(
  state: BuilderState,
  uid: string,
  edit: (battery: BuilderBattery) => BuilderBattery,
): BuilderState {
  return { ...state, batteries: state.batteries.map(b => (b.uid === uid ? edit(b) : b)) };
}

export function hasPhaseAnchor(
  battery: BuilderBattery,
  phaseUid: string,
  position: 'start' | 'end',
): boolean {
  return battery.anchors.some(a =>
    a.kind === 'phase' && a.phaseUid === phaseUid && a.position === position);
}

export function dateAnchors(battery: BuilderBattery): string[] {
  return battery.anchors
    .filter((a): a is { kind: 'date'; date: string } => a.kind === 'date')
    .map(a => a.date)
    .sort();
}

/**
 * Batteries worth creating. One with no tests in it prescribes nothing,
 * and one with no anchors never happens — neither is a plan, and writing
 * either would put an empty row on the athlete's calendar.
 */
export function schedulableBatteries(state: BuilderState): BuilderBattery[] {
  return state.batteries.filter(b => b.templateIds.length > 0 && b.anchors.length > 0);
}

// ── session plans ─────────────────────────────────────────────

function clampCount(n: number, min: number): number {
  return Math.min(14, Math.max(min, n));
}

function pruneOverrides(
  overrides: Record<number, Record<ActivityKey, number>>,
  weeks: number,
): Record<number, Record<ActivityKey, number>> {
  const kept: Record<number, Record<ActivityKey, number>> = {};
  for (const [week, counts] of Object.entries(overrides)) {
    if (Number(week) < weeks) kept[Number(week)] = counts;
  }
  return kept;
}

/**
 * The typical week a phase type starts from. Materialised on first edit
 * rather than up front, so a phase the athlete never opened keeps
 * following the catalog even if the catalog later changes.
 */
export function defaultSessionPlan(phaseType: string): SessionPlan {
  const mix = defaultMix(phaseType);
  const activityPlans = {} as Record<ActivityKey, ActivityPlan>;
  for (const a of activities) {
    const n = mix[a.key] ?? 0;
    activityPlans[a.key] = { included: n > 0, freq: Math.max(1, n) };
  }
  return { activities: activityPlans, overrides: {}, otherLabel: '' };
}

export function sessionPlan(state: BuilderState, phase: BuilderPhase): SessionPlan {
  return state.sessionPlans[phase.uid] ?? defaultSessionPlan(phase.type);
}

function editPlan(
  state: BuilderState,
  uid: string,
  edit: (plan: SessionPlan) => SessionPlan,
): BuilderState {
  const phase = state.phases.find(p => p.uid === uid);
  if (!phase) return state;
  const current = state.sessionPlans[uid] ?? defaultSessionPlan(phase.type);
  return { ...state, sessionPlans: { ...state.sessionPlans, [uid]: edit(current) } };
}

/** The phase's typical week: what every week does unless it says otherwise. */
export function baselineWeek(plan: SessionPlan): Record<ActivityKey, number> {
  const counts = {} as Record<ActivityKey, number>;
  for (const a of activities) {
    const entry = plan.activities[a.key];
    counts[a.key] = entry?.included ? entry.freq : 0;
  }
  return counts;
}

/** What one week actually prescribes — its own edit, or the typical week. */
export function effectiveWeek(plan: SessionPlan, week: number): Record<ActivityKey, number> {
  return plan.overrides[week] ?? baselineWeek(plan);
}

export function isWeekEdited(plan: SessionPlan, week: number): boolean {
  return plan.overrides[week] !== undefined;
}

export function weekTotal(counts: Record<ActivityKey, number>): number {
  return activities.reduce((sum, a) => sum + (counts[a.key] ?? 0), 0);
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
