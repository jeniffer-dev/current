'use client';

import { useReducer, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createMacrocycle } from '@/app/(app)/macrocycle/new/actions';
import {
  baselineWeek,
  builderReducer,
  schedulableBatteries,
  goalStepBlocker,
  includedPhases,
  initialBuilderState,
  phaseName,
  sessionPlan,
  type TestTemplate,
} from './state';
import { activities } from '@/lib/session-catalog';
import { GoalStep } from './goal-step';
import { TestsStep } from './tests-step';
import { PhasesStep } from './phases-step';
import { SessionsStep } from './sessions-step';

const STEPS = ['Goal', 'Phases', 'Sessions', 'Testing'] as const;

export function MacrocycleBuilder({
  today,
  currentPlanName,
  templates,
}: {
  today:           string;
  currentPlanName: string | null;
  templates:       TestTemplate[];
}) {
  const router = useRouter();
  const [state, dispatch] = useReducer(builderReducer, { today, templates }, initialBuilderState);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const phases  = includedPhases(state);
  const blocker = goalStepBlocker(state);

  // No forward button is ever disabled. A greyed-out button cannot say what
  // it wants, so pressing it is the fastest way to find out: it states the
  // problem and moves the cursor to the field that has it.
  function goToStep(step: 0 | 1 | 2 | 3) {
    if (step > 0 && blocker) {
      setError(blocker.message);
      dispatch({ type: 'step', step: 0 });
      const field = document.getElementById(blocker.fieldId);
      // Scroll as well as focus: the field is usually above the fold from
      // where the button sits, and a cursor you cannot see is no guidance.
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field?.focus({ preventScroll: true });
      return;
    }
    if (step > 1 && phases.length === 0) {
      setError('Keep at least one phase — the training mix belongs to a phase.');
      dispatch({ type: 'step', step: 1 });
      return;
    }
    setError(null);
    dispatch({ type: 'step', step });
  }

  function submit() {
    if (blocker) {
      setError(blocker.message);
      dispatch({ type: 'step', step: 0 });
      return;
    }
    if (phases.length === 0) {
      setError('Keep at least one phase to create the plan.');
      dispatch({ type: 'step', step: 1 });
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createMacrocycle({
        name:       state.name.trim(),
        goalEvent:  state.goalEvent.trim() || null,
        startDate:  state.startDate,
        targetDate: state.targetDate,
        phases:     phases.map(phase => {
          const plan     = sessionPlan(state, phase);
          const baseline = baselineWeek(plan);
          return {
            type:        phase.type,
            name:        phaseName(phase),
            description: phase.description.trim() || null,
            weeks:       phase.weeks,
            // Only the activities that are actually trained. An activity at
            // zero is not a prescription of nothing — it is the absence of
            // one, and it should not become a row.
            sessions: activities
              .filter(a => baseline[a.key] > 0)
              .map(a => ({
                key:             a.key,
                label:           a.key === 'other' ? (plan.otherLabel.trim() || null) : null,
                sessionsPerWeek: baseline[a.key],
              })),
            // Sparse: only the weeks the athlete changed.
            weekOverrides: Object.entries(plan.overrides)
              .filter(([week]) => Number(week) < phase.weeks)
              .map(([week, counts]) => ({
                weekIndex: Number(week),
                counts: activities
                  .filter(a => counts[a.key] > 0 || baseline[a.key] > 0)
                  .map(a => ({ key: a.key, sessionsCount: counts[a.key] ?? 0 })),
              })),
          };
        }),
        // Testing is optional. Batteries with no tests or no dates are
        // dropped here rather than becoming empty rows on the calendar.
        batteries: schedulableBatteries(state).map(battery => ({
          name:        battery.name.trim() || 'Testing',
          kind:        battery.kind,
          templateIds: battery.templateIds,
          anchors:     battery.anchors.map(anchor =>
            anchor.kind === 'phase'
              // Phases have no ids yet, so an anchor travels as the INDEX of
              // its phase in the submitted list and is resolved after insert.
              ? {
                  kind:       'phase' as const,
                  phaseIndex: phases.findIndex(p => p.uid === anchor.phaseUid),
                  position:   anchor.position,
                  date:       null,
                }
              : { kind: 'date' as const, phaseIndex: null, position: null, date: anchor.date },
          ).filter(a => a.kind === 'date' || a.phaseIndex >= 0),
        })),
      });
      if (result?.error) { setError(result.error); return; }
      router.push('/macrocycle');
    });
  }

  return (
    <div className="mx-auto w-full max-w-[720px] px-5 pb-8 pt-6 sm:px-8 md:px-10">
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button" variant="ghost" size="sm"
          className="-ml-3 min-w-[74px] justify-start text-muted-foreground"
          onClick={() => router.push('/macrocycle')}
        >
          Cancel
        </Button>

        <nav aria-label="Progress" className="flex items-center gap-2.5">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => goToStep(i as 0 | 1 | 2 | 3)}
              aria-current={i === state.step ? 'step' : undefined}
              className="flex flex-col items-center gap-1.5 px-1 py-1 disabled:opacity-40"
            >
              <span
                className="h-1 w-[34px] rounded-sm"
                style={{
                  backgroundColor:
                    i < state.step ? 'hsl(var(--primary))'
                    : i === state.step ? 'hsl(var(--foreground))'
                    : 'hsl(var(--border))',
                }}
              />
              <span className={`text-[11px] font-medium ${i === state.step ? '' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </button>
          ))}
        </nav>

        <span className="min-w-[74px] text-right text-xs text-muted-foreground">
          Step {state.step + 1} of {STEPS.length}
        </span>
      </div>

      <div className="pt-8">
        {state.step === 0 && (
          <GoalStep state={state} dispatch={dispatch} currentPlanName={currentPlanName} today={today} />
        )}
        {state.step === 1 && <PhasesStep state={state} dispatch={dispatch} />}
        {state.step === 2 && <SessionsStep state={state} dispatch={dispatch} />}
        {state.step === 3 && <TestsStep state={state} dispatch={dispatch} />}
      </div>

      {/* The message lives inside the sticky bar, not in document flow: the
          button is pinned to the bottom of the viewport, so an explanation
          rendered after the page content can sit below the fold — pressing
          the button then looks like it does nothing at all. */}
      <div className="sticky bottom-0 mt-8 bg-gradient-to-t from-background from-60% to-transparent pb-6 pt-7">
        {error && (
          <p role="alert" className="pb-3 text-right text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-4">
          {state.step > 0 ? (
            <Button
              type="button" variant="ghost"
              onClick={() => dispatch({ type: 'step', step: (state.step - 1) as 0 | 1 | 2 })}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          ) : <div />}

          {state.step === STEPS.length - 1 ? (
            <Button type="button" size="lg" disabled={isPending} onClick={submit}>
              {isPending ? 'Creating…' : 'Create plan'}
            </Button>
          ) : (
            <Button type="button" onClick={() => goToStep((state.step + 1) as 1 | 2 | 3)}>
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
