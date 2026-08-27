'use client';

import { useReducer, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createMacrocycle } from '@/app/(app)/macrocycle/new/actions';
import {
  builderReducer,
  goalStepBlocker,
  includedPhases,
  initialBuilderState,
  phaseName,
} from './state';
import { GoalStep } from './goal-step';
import { PhasesStep } from './phases-step';

const STEPS = ['Goal', 'Phases'] as const;

export function MacrocycleBuilder({ today, currentPlanName }: { today: string; currentPlanName: string | null }) {
  const router = useRouter();
  const [state, dispatch] = useReducer(builderReducer, today, initialBuilderState);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const phases  = includedPhases(state);
  const blocker = goalStepBlocker(state);

  // The forward button is never disabled. A greyed-out button cannot say
  // what it wants, so pressing it is the fastest way to find out: it
  // states the problem and moves the cursor to the field that has it.
  function goToPhases() {
    if (blocker) {
      setError(blocker.message);
      const field = document.getElementById(blocker.fieldId);
      // Scroll as well as focus: the field is usually above the fold from
      // where the button sits, and a cursor you cannot see is no guidance.
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field?.focus({ preventScroll: true });
      return;
    }
    setError(null);
    dispatch({ type: 'step', step: 1 });
  }

  function submit() {
    if (blocker) {
      setError(blocker.message);
      dispatch({ type: 'step', step: 0 });
      return;
    }
    if (phases.length === 0) {
      setError('Keep at least one phase to create the plan.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createMacrocycle({
        name:       state.name.trim(),
        goalEvent:  state.goalEvent.trim() || null,
        startDate:  state.startDate,
        targetDate: state.targetDate,
        phases:     phases.map(phase => ({
          type:        phase.type,
          name:        phaseName(phase),
          description: phase.description.trim() || null,
          weeks:       phase.weeks,
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
              onClick={() => (i === 0 ? dispatch({ type: 'step', step: 0 }) : goToPhases())}
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
        {state.step === 0
          ? <GoalStep state={state} dispatch={dispatch} currentPlanName={currentPlanName} today={today} />
          : <PhasesStep state={state} dispatch={dispatch} />}
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
            <Button type="button" variant="ghost" onClick={() => dispatch({ type: 'step', step: 0 })}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          ) : <div />}

          {state.step === STEPS.length - 1 ? (
            <Button type="button" size="lg" disabled={isPending} onClick={submit}>
              {isPending ? 'Creating…' : 'Create plan'}
            </Button>
          ) : (
            <Button type="button" onClick={goToPhases}>
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
