'use client';

import { Check, Minus, Plus, RotateCcw, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { phaseColor } from '@/lib/phase-catalog';
import { activities, activityLabel } from '@/lib/session-catalog';
import {
  baselineWeek,
  effectiveWeek,
  includedPhases,
  isWeekEdited,
  phaseName,
  sessionPlan,
  weekTotal,
  type BuilderAction,
  type BuilderPhase,
  type BuilderState,
  type SessionPlan,
} from './state';

function Stepper({
  value,
  min,
  onChange,
  label,
}: {
  value:    number;
  min:      number;
  onChange: (delta: number) => void;
  label:    string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        type="button" variant="outline" size="icon"
        className="h-[26px] w-[26px]"
        disabled={value <= min}
        aria-label={`One less ${label}`}
        onClick={() => onChange(-1)}
      >
        <Minus className="h-3 w-3" strokeWidth={2.5} />
      </Button>
      <span className="min-w-[42px] text-center text-[13px] font-semibold tabular-nums">
        ×{value}
      </span>
      <Button
        type="button" variant="outline" size="icon"
        className="h-[26px] w-[26px]"
        aria-label={`One more ${label}`}
        onClick={() => onChange(1)}
      >
        <Plus className="h-3 w-3" strokeWidth={2.5} />
      </Button>
    </div>
  );
}

/** The phase's typical week — the baseline every week follows by default. */
function TypicalWeek({
  phase,
  plan,
  dispatch,
}: {
  phase:    BuilderPhase;
  plan:     SessionPlan;
  dispatch: (action: BuilderAction) => void;
}) {
  return (
    <div>
      {activities.map(activity => {
        const entry = plan.activities[activity.key];
        const on    = entry.included;
        return (
          <div
            key={activity.key}
            className="flex items-center gap-3.5 border-b border-border py-3.5 last:border-b-0"
            style={{ opacity: on ? 1 : 0.4 }}
          >
            <button
              type="button"
              onClick={() => dispatch({ type: 'toggleActivity', uid: phase.uid, key: activity.key })}
              aria-label={on
                ? `Drop ${activity.label} from ${phaseName(phase)}`
                : `Train ${activity.label} in ${phaseName(phase)}`}
              aria-pressed={on}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border-[1.5px] transition-colors hover:bg-muted"
              style={{ borderColor: activity.color, color: activity.color }}
            >
              {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </button>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-sm font-semibold">{activity.label}</span>
              {activity.key === 'other' && on && (
                <Input
                  value={plan.otherLabel}
                  onChange={e => dispatch({ type: 'setOtherLabel', uid: phase.uid, value: e.target.value })}
                  placeholder="Name this one…"
                  aria-label={`Name the other session in ${phaseName(phase)}`}
                  className="h-7 max-w-[240px] border-transparent bg-muted px-2 text-xs"
                />
              )}
            </div>

            {on && (
              <>
                <Stepper
                  value={entry.freq}
                  min={1}
                  label={`${activity.label} per week`}
                  onChange={delta => dispatch({ type: 'setFreq', uid: phase.uid, key: activity.key, delta })}
                />
                <span className="hidden w-[62px] shrink-0 text-right text-[11px] text-muted-foreground sm:block">
                  per week
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** One week's own prescription, opened from the week strip. */
function WeekEditor({
  phase,
  plan,
  week,
  dispatch,
}: {
  phase:    BuilderPhase;
  plan:     SessionPlan;
  week:     number;
  dispatch: (action: BuilderAction) => void;
}) {
  const counts  = effectiveWeek(plan, week);
  const edited  = isWeekEdited(plan, week);
  const trained = activities.filter(a => baselineWeek(plan)[a.key] > 0 || counts[a.key] > 0);

  return (
    <div className="space-y-3 rounded-xl bg-muted/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          Week {week + 1}
          {!edited && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              following the typical week
            </span>
          )}
        </p>
        <div className="flex items-center gap-1">
          <Button
            type="button" variant="ghost" size="sm"
            className="text-xs"
            onClick={() => dispatch({ type: 'deloadWeek', uid: phase.uid, week })}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            Deload
          </Button>
          {edited && (
            <Button
              type="button" variant="ghost" size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => dispatch({ type: 'resetWeek', uid: phase.uid, week })}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {trained.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nothing is trained in this phase yet — turn something on above.
        </p>
      ) : (
        <div className="space-y-2">
          {trained.map(activity => (
            <div key={activity.key} className="flex items-center gap-3">
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-sm"
                style={{ backgroundColor: activity.color }}
              />
              <span className="min-w-0 flex-1 truncate text-[13px]">
                {activityLabel(activity.key, activity.key === 'other' ? plan.otherLabel : null)}
              </span>
              <Stepper
                value={counts[activity.key]}
                min={0}
                label={`${activity.label} in week ${week + 1}`}
                onChange={delta =>
                  dispatch({ type: 'adjustWeek', uid: phase.uid, week, key: activity.key, delta })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SessionsStep({
  state,
  dispatch,
}: {
  state:    BuilderState;
  dispatch: (action: BuilderAction) => void;
}) {
  const phases = includedPhases(state);
  const active = phases.find(p => p.uid === state.activePhaseUid) ?? phases[0] ?? null;

  if (!active) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
        <p className="text-sm text-muted-foreground">
          Go back and keep at least one phase — the training mix belongs to a phase.
        </p>
      </div>
    );
  }

  const plan     = sessionPlan(state, active);
  const baseline = baselineWeek(plan);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
        <p className="max-w-[540px] text-sm leading-relaxed text-muted-foreground">
          How a week looks depends on the phase you&apos;re in — and some weeks step away
          from that. Set the typical week here, then edit only the weeks that differ.
        </p>
      </div>

      {/* Phase selector. The mix is a property of the phase, so the phase is
          the first thing to pick. */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {phases.map(phase => {
          const on = phase.uid === active.uid;
          return (
            <button
              key={phase.uid}
              type="button"
              onClick={() => dispatch({ type: 'selectPhase', uid: phase.uid })}
              aria-current={on ? 'true' : undefined}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                on ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-muted'
              }`}
            >
              <span
                aria-hidden
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: phaseColor(phase.type) }}
              />
              {phaseName(phase)}
            </button>
          );
        })}
      </div>

      <Card>
        <CardContent className="space-y-4 px-6 py-5">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              A typical week in {phaseName(active)}
            </p>
            <p className="text-xs text-muted-foreground">
              {weekTotal(baseline)} sessions a week, over {active.weeks}{' '}
              {active.weeks === 1 ? 'week' : 'weeks'}.
            </p>
          </div>

          <TypicalWeek phase={active} plan={plan} dispatch={dispatch} />

          {/* Week strip. A week that carries its own numbers is marked, so
              the athlete can see at a glance which ones they changed. */}
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Week by week
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: active.weeks }, (_, week) => {
                const edited = isWeekEdited(plan, week);
                const open   = state.activeWeek === week;
                const total  = weekTotal(effectiveWeek(plan, week));
                return (
                  <button
                    key={week}
                    type="button"
                    onClick={() => dispatch({ type: 'selectWeek', week })}
                    aria-expanded={open}
                    aria-label={`Week ${week + 1}, ${total} sessions${edited ? ', edited' : ''}`}
                    className={`flex h-[46px] w-[46px] flex-col items-center justify-center gap-0.5 rounded-lg border text-[11px] transition-colors ${
                      open   ? 'border-foreground bg-foreground text-background'
                      : edited ? 'border-foreground/30 bg-muted'
                      : 'border-border hover:bg-muted'
                    }`}
                  >
                    <span className="font-semibold tabular-nums">W{week + 1}</span>
                    <span className={open ? 'opacity-80' : 'text-muted-foreground'}>{total}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Pick a week to change it on its own. Weeks you haven&apos;t touched follow the
              typical week.
            </p>
          </div>

          {state.activeWeek !== null && state.activeWeek < active.weeks && (
            <WeekEditor phase={active} plan={plan} week={state.activeWeek} dispatch={dispatch} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
