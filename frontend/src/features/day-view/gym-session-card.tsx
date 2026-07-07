import { Dumbbell, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SessionStatusControl } from './session-status-control';
import { SessionNotesInput } from './session-notes-input';
import { ExerciseLogSection } from './exercise-log-section';
import type { ExerciseLog } from './exercise-log-section';
import { getWeeklyPrescription } from '@/lib/suggested-weight';
import type { WeightSuggestion, WeekPrescription } from '@/lib/suggested-weight';

type SessionRecord = {
  id: string;
  status: 'planned' | 'completed' | 'skipped';
  notes: string | null;
} | null;

// ── types ─────────────────────────────────────────────────────

type GymExercise = {
  id: string;
  order_index: number;
  sets: number | null;
  reps: string | null;
  rpe: string | null;
  intensity_type: string;
  intensity_value: string | null;
  notes: string | null;
  exercises: { id: string; name: string; is_loggable: boolean; primary_test_template_id?: string | null };
};

type GymTemplate = {
  id: string;
  name: string;
  focus: string | null;
  gym_session_exercises: GymExercise[];
};

// ── focus mapping (display-only) ──────────────────────────────

const SESSION_FOCUS: Record<string, string> = {
  'ADP – Day 1': 'Full Body Adaptation',
  'ADP – Day 2': 'Full Body Adaptation',
  'ADP – Day 3': 'Glute Strength & Hypertrophy',
};

// ── block definitions ─────────────────────────────────────────

type BlockDef = {
  letter: string;
  label: string;
  isCircuit: boolean;
  rounds?: number;
  restBetween?: string;
  restRound?: string;
};

const BLOCK_DEFS: Record<string, BlockDef> = {
  // ADP Day 1 & 2
  'lower-prep':    { letter: 'B', label: 'Lower Prep',    isCircuit: false },
  'lower-circuit': { letter: 'B', label: 'Lower Circuit', isCircuit: true,  rounds: 3, restBetween: '10 sec between exercises', restRound: '1 min between rounds' },
  'upper-prep':    { letter: 'C', label: 'Upper Prep',    isCircuit: false },
  'upper-circuit': { letter: 'C', label: 'Upper Circuit', isCircuit: true,  rounds: 3, restBetween: '10 sec between exercises', restRound: '1 min between rounds' },
  'core-circuit':  { letter: 'D', label: 'Core Circuit',  isCircuit: true,  rounds: 3, restBetween: '10 sec between exercises', restRound: '1 min between rounds' },
  'prehab':        { letter: 'E', label: 'Prehab',        isCircuit: false },
  // ADP Day 3
  'glute-strength':  { letter: 'A', label: 'Glute Strength',  isCircuit: false },
  'glute-isolation': { letter: 'B', label: 'Glute Isolation', isCircuit: false },
  'activation':      { letter: 'C', label: 'Activation',      isCircuit: false },
  'core':            { letter: 'D', label: 'Core',            isCircuit: false },
  // ACC blocks — letters omitted; label auto-derived from key for main-N / main-N-prep / accessory-N
  'warmup':              { letter: '', label: 'Mobility & Strength Prep', isCircuit: false },
  'accessories-circuit': { letter: '', label: 'Accessories Circuit',      isCircuit: true, rounds: 3 },
};

// ── block key inference from exercise notes ───────────────────

function extractBlockKey(notes: string | null): string {
  if (!notes) return 'other';
  const primary = notes.split('·')[0].trim().toLowerCase();

  // ADP Day 1 & 2
  if (/lower circuit/.test(primary)) return 'lower-circuit';
  if (/upper circuit/.test(primary)) return 'upper-circuit';
  if (/core circuit/.test(primary))  return 'core-circuit';
  if (/lower prep/.test(primary))    return 'lower-prep';
  if (/upper prep/.test(primary))    return 'upper-prep';
  if (/prehab/.test(primary))        return 'prehab';

  // ADP Day 3
  if (/main glute|glute strength|glute hypertrophy/.test(primary)) return 'glute-strength';
  if (/glute isolation|hip hinge accessory|unilateral glute/.test(primary)) return 'glute-isolation';
  if (/glute med|activation/.test(primary)) return 'activation';
  if (/^core$/.test(primary)) return 'core';

  // ACC — dynamic main-N-prep / main-N / accessory-N keys so any number works
  const mainPrepMatch = primary.match(/^main (\d+) prep$/);
  if (mainPrepMatch) return `main-${mainPrepMatch[1]}-prep`;

  const mainMatch = primary.match(/^main (\d+)$/);
  if (mainMatch) return `main-${mainMatch[1]}`;

  const accessoryMatch = primary.match(/^accessory (\d+)$/);
  if (accessoryMatch) return `accessory-${accessoryMatch[1]}`;

  if (/accessories circuit/.test(primary)) return 'accessories-circuit';
  if (/^core x\d+/.test(primary))         return 'core-circuit';
  if (/^mobility/.test(primary))           return 'warmup';

  return 'other';
}

// Extra note = everything after the first "·" separator
function extractExerciseNote(notes: string | null): string | null {
  if (!notes) return null;
  const idx = notes.indexOf('·');
  if (idx === -1) return null;
  return notes.slice(idx + 1).trim() || null;
}

// ── prescription ──────────────────────────────────────────────

function prescription(ex: GymExercise, macroPrescription: WeekPrescription | null): string {
  // "Macro %" sentinel — resolve from weekly prescription table
  if (ex.intensity_type === 'percentage' && ex.rpe === 'Macro %' && macroPrescription) {
    const p = macroPrescription;
    return `${p.sets} × ${p.reps}  ·  ${p.pct * 100}%`;
  }

  const reps = ex.reps ?? '—';
  // Circuit exercises have null sets — show just reps (sets = rounds, defined by block)
  const base = ex.sets !== null ? `${ex.sets} × ${reps}` : reps;

  if (ex.intensity_type === 'percentage' && ex.intensity_value) {
    return `${base}  ·  ${ex.intensity_value}%`;
  }
  if (ex.intensity_type === 'rpe' && ex.rpe) {
    return `${base}  ·  ${ex.rpe}`;
  }
  return base;
}

// ── block grouping ────────────────────────────────────────────

type Block = BlockDef & { key: string; exercises: GymExercise[] };

function groupIntoBlocks(exercises: GymExercise[]): Block[] {
  const order: string[] = [];
  const map = new Map<string, Block>();

  for (const ex of exercises) {
    const key = extractBlockKey(ex.notes);
    if (!map.has(key)) {
      const def = BLOCK_DEFS[key] ?? { letter: '', label: key.replace(/-/g, ' '), isCircuit: false };
      map.set(key, { key, ...def, exercises: [] });
      order.push(key);
    }
    map.get(key)!.exercises.push(ex);
  }

  return order.map(k => map.get(k)!);
}

// ── component ─────────────────────────────────────────────────

export function GymSessionCard({
  sessionName,
  template,
  sessionRecord,
  trainingDayId,
  exerciseLogs,
  suggestionsByExerciseId,
  phaseType,
  weekInPhase,
}: {
  sessionName:              string;
  template:                 GymTemplate | null;
  sessionRecord?:           SessionRecord;
  trainingDayId?:           string;
  exerciseLogs?:            ExerciseLog[];
  suggestionsByExerciseId?: Record<string, WeightSuggestion>;
  phaseType?:               string;
  weekInPhase?:             number;
}) {
  const macroPrescription = getWeeklyPrescription(phaseType ?? '', weekInPhase ?? 1);

  const exercises = template
    ? [...template.gym_session_exercises].sort((a, b) => a.order_index - b.order_index)
    : [];

  const templateName = template?.name ?? '';
  const focus = template?.focus ?? SESSION_FOCUS[templateName] ?? null;
  const blocks = groupIntoBlocks(exercises);

  // Use block view when exercises map to known blocks; flat list otherwise
  const hasNamedBlocks = blocks.some(b => b.key !== 'other');

  // Build exercise_id → log lookup for O(1) access
  const logByExerciseId = new Map<string, ExerciseLog>(
    (exerciseLogs ?? []).map(l => [l.exercise_id, l])
  );

  return (
    <Card>
      <CardContent className="p-6">

        {/* Session header */}
        <div className="flex items-start justify-between gap-4 mb-1">
          <div className="flex items-center gap-2.5">
            <Dumbbell className="h-4 w-4 shrink-0" style={{ color: 'var(--current-load)' }} />
            <p className="text-sm font-semibold">{sessionName}</p>
          </div>
          {sessionRecord && trainingDayId && (
            <SessionStatusControl
              sessionId={sessionRecord.id}
              initialStatus={sessionRecord.status}
              trainingDayId={trainingDayId}
            />
          )}
        </div>

        {focus && (
          <p className="text-xs text-muted-foreground/60 ml-[26px]">{focus}</p>
        )}

        {/* Content */}
        {exercises.length === 0 ? (
          <p className="text-sm text-muted-foreground/40 mt-5">No exercises configured yet.</p>

        ) : hasNamedBlocks ? (
          // ── Block view ──────────────────────────────────────
          <div className="max-w-[540px]">
            {blocks.map((block) => (
              <div key={block.key}>

                {/* Full-width section divider */}
                <div className="border-t border-border/50 -mx-6 my-5" />

                {/* Block label */}
                <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-muted-foreground/60 mb-3.5 mt-0.5">
                  {block.letter ? `${block.letter} · ` : ''}{block.label}
                  {block.isCircuit && block.rounds ? ` ×${block.rounds}` : ''}
                </p>

                {/* Exercise rows */}
                <div>
                  {block.exercises.map((ex, i) => {
                    const note     = extractExerciseNote(ex.notes);
                    const loggable = sessionRecord && trainingDayId && ex.exercises.is_loggable;
                    return (
                      <div
                        key={ex.id}
                        className={`py-2.5 ${i > 0 ? 'border-t border-border/30' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{ex.exercises.name}</p>
                            {note && (
                              <p className="text-xs text-muted-foreground/40 mt-0.5">{note}</p>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground/60 tabular-nums shrink-0">
                            {prescription(ex, macroPrescription)}
                          </p>
                        </div>
                        {loggable && (
                          <ExerciseLogSection
                            exerciseId={ex.exercises.id}
                            sessionId={sessionRecord!.id}
                            trainingDayId={trainingDayId!}
                            existingLog={logByExerciseId.get(ex.exercises.id) ?? null}
                            suggestion={suggestionsByExerciseId?.[ex.exercises.id] ?? null}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Circuit rules */}
                {block.isCircuit && (block.restBetween || block.restRound) && (
                  <div className="mt-4 flex gap-2 items-start">
                    <Info className="h-3 w-3 text-muted-foreground/30 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-muted-foreground/35 mb-1.5">
                        Circuit Rules
                      </p>
                      <div className="space-y-0.5">
                        {block.restBetween && (
                          <p className="text-xs text-muted-foreground/40">{block.restBetween}</p>
                        )}
                        {block.restRound && (
                          <p className="text-xs text-muted-foreground/40">{block.restRound}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>

        ) : (
          // ── Flat list fallback (templates without block mapping) ──
          <div className="mt-5 divide-y divide-border/50 max-w-[540px]">
            {exercises.map((ex) => (
              <div key={ex.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{ex.exercises.name}</p>
                  <p className="text-sm text-muted-foreground/65 tabular-nums">{prescription(ex, macroPrescription)}</p>
                </div>
                {sessionRecord && trainingDayId && (
                  <ExerciseLogSection
                    exerciseId={ex.exercises.id}
                    sessionId={sessionRecord.id}
                    trainingDayId={trainingDayId}
                    existingLog={logByExerciseId.get(ex.exercises.id) ?? null}
                    suggestion={suggestionsByExerciseId?.[ex.exercises.id] ?? null}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {sessionRecord && trainingDayId && (
          <SessionNotesInput
            sessionId={sessionRecord.id}
            trainingDayId={trainingDayId}
            initialNotes={sessionRecord.notes}
          />
        )}

      </CardContent>
    </Card>
  );
}
