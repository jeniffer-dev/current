'use client';

import { Check, Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { phaseColor, suggestedPhases } from '@/lib/phase-catalog';
import { planEndDate, planFit, totalWeeks } from '@/lib/phase-plan';
import { includedPhases, phaseName, phaseNote, type BuilderAction, type BuilderState } from './state';

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function weekLabel(n: number) {
  return `${n} ${n === 1 ? 'week' : 'weeks'}`;
}

function FitMessage({ state }: { state: BuilderState }) {
  const phases = includedPhases(state);
  const fit = planFit(state.startDate, state.targetDate, phases);
  const event = state.goalEvent.trim() || 'your event';

  const { text, tone } = (() => {
    switch (fit.kind) {
      case 'exact':
        return {
          text: `Your plan lines up with ${event} — ${weekLabel(fit.weeks)}, right on the date.`,
          tone: 'bg-emerald-50 text-emerald-700',
        };
      case 'short':
        return {
          text: `You're ${weekLabel(fit.weeks)} short of ${event} — add weeks to a phase, or that time sits unplanned.`,
          tone: 'bg-orange-50 text-orange-700',
        };
      case 'over':
        return {
          text: `Your plan runs ${weekLabel(fit.weeks)} past ${event} — trim a phase to land on time.`,
          tone: 'bg-orange-50 text-orange-700',
        };
      default:
        return {
          text: 'Add at least one phase to see how the plan lines up with your event.',
          tone: 'bg-muted text-muted-foreground',
        };
    }
  })();

  return (
    <div className={`rounded-xl px-5 py-3.5 ${tone}`}>
      <p className="text-sm font-medium leading-relaxed">{text}</p>
    </div>
  );
}

export function PhasesStep({
  state,
  dispatch,
}: {
  state:    BuilderState;
  dispatch: (action: BuilderAction) => void;
}) {
  const included = includedPhases(state);
  const total    = totalWeeks(included) || 1;
  const endDate  = included.length ? planEndDate(state.startDate, included) : state.startDate;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Phases</h1>
        <p className="max-w-[540px] text-sm leading-relaxed text-muted-foreground">
          Every macrocycle moves through blocks with a different job each — heavy and general
          early, sharp and specific right before it counts. Phases can repeat.
        </p>
      </div>

      <Card>
        <CardContent className="px-6 py-1">
          {state.phases.map(phase => {
            const color = phaseColor(phase.type);
            return (
              <div
                key={phase.uid}
                className="flex items-center gap-3.5 border-b border-border py-4 last:border-b-0"
                style={{ opacity: phase.included ? 1 : 0.4 }}
              >
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'togglePhase', uid: phase.uid })}
                  aria-label={phase.included ? `Exclude ${phaseName(phase)}` : `Include ${phaseName(phase)}`}
                  aria-pressed={phase.included}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border-[1.5px] transition-colors hover:bg-muted"
                  style={{ borderColor: color, color }}
                >
                  {phase.included && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </button>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-sm font-semibold">{phaseName(phase)}</span>
                  {phase.type === 'custom' ? (
                    <Input
                      value={phase.description}
                      onChange={e => dispatch({ type: 'setDescription', uid: phase.uid, value: e.target.value })}
                      placeholder="Describe this phase…"
                      aria-label={`Description for ${phaseName(phase)}`}
                      className="h-7 border-transparent bg-muted px-2 text-xs"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">{phaseNote(phase)}</span>
                  )}
                </div>

                {phase.included && (
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button" variant="outline" size="icon"
                      className="h-[26px] w-[26px]"
                      aria-label={`One week less of ${phaseName(phase)}`}
                      onClick={() => dispatch({ type: 'setWeeks', uid: phase.uid, delta: -1 })}
                    >
                      <Minus className="h-3 w-3" strokeWidth={2.5} />
                    </Button>
                    <span className="min-w-[46px] text-center text-[13px] font-semibold">
                      {phase.weeks} wks
                    </span>
                    <Button
                      type="button" variant="outline" size="icon"
                      className="h-[26px] w-[26px]"
                      aria-label={`One week more of ${phaseName(phase)}`}
                      onClick={() => dispatch({ type: 'setWeeks', uid: phase.uid, delta: 1 })}
                    >
                      <Plus className="h-3 w-3" strokeWidth={2.5} />
                    </Button>
                  </div>
                )}

                <Button
                  type="button" variant="ghost" size="icon"
                  className="h-[26px] w-[26px] shrink-0"
                  aria-label={`Remove ${phaseName(phase)}`}
                  onClick={() => dispatch({ type: 'removePhase', uid: phase.uid })}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}

          <div className="flex flex-col gap-3 py-4">
            {state.addingPhase ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Add another phase
                  </p>
                  <Button type="button" variant="ghost" size="sm" onClick={() => dispatch({ type: 'toggleAdding' })}>
                    Cancel
                  </Button>
                </div>
                <p className="max-w-[520px] text-xs leading-relaxed text-muted-foreground">
                  Phases can repeat — a long season often runs Transmutation → Realization more
                  than once before the event.
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedPhases.map(suggested => (
                    <button
                      key={suggested.type}
                      type="button"
                      onClick={() => dispatch({ type: 'addPhase', phaseType: suggested.type })}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-sm"
                        style={{ backgroundColor: phaseColor(suggested.type) }}
                      />
                      {suggested.name}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <Input
                    value={state.customPhaseName}
                    onChange={e => dispatch({ type: 'setField', field: 'customPhaseName', value: e.target.value })}
                    placeholder="…or name your own phase"
                    aria-label="Name your own phase"
                    className="h-8 max-w-[280px] text-[13px]"
                  />
                  <Button
                    type="button" variant="outline" size="sm"
                    disabled={!state.customPhaseName.trim()}
                    onClick={() => dispatch({ type: 'addCustomPhase' })}
                  >
                    Add
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button" variant="outline"
                className="self-start"
                onClick={() => dispatch({ type: 'toggleAdding' })}
              >
                <Plus className="h-3.5 w-3.5" />
                Add phase
              </Button>
            )}
          </div>

          {included.length > 0 && (
            <div className="space-y-2 border-t border-border py-4">
              <div className="flex h-2 w-full gap-px overflow-hidden rounded-full bg-muted">
                {included.map(phase => (
                  <div
                    key={phase.uid}
                    style={{
                      width: `${(phase.weeks / total) * 100}%`,
                      backgroundColor: phaseColor(phase.type),
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{formatDate(state.startDate)}</span>
                <span>{weekLabel(totalWeeks(included))} total</span>
                <span>{formatDate(endDate)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <FitMessage state={state} />
    </div>
  );
}
