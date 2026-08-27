'use client';

import { Calendar, Layers, Minus, ListChecks } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { weeksBetween } from '@/lib/phase-plan';
import type { BuilderAction, BuilderState } from './state';

const hierarchy = [
  { icon: Calendar,   label: 'Macrocycle', hint: 'the season' },
  { icon: Layers,     label: 'Phases',     hint: 'blocks of weeks' },
  { icon: Minus,      label: 'Weeks',      hint: 'one microcycle' },
  { icon: ListChecks, label: 'Sessions',   hint: 'gym, swim…' },
];

export function GoalStep({
  state,
  dispatch,
}: {
  state:    BuilderState;
  dispatch: (action: BuilderAction) => void;
}) {
  const set = (field: 'name' | 'goalEvent' | 'startDate' | 'targetDate') =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: 'setField', field, value: e.target.value });

  const weeksToEvent = weeksBetween(state.startDate, state.targetDate);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Let&apos;s build your macrocycle</h1>
        <p className="max-w-[540px] text-sm leading-relaxed text-muted-foreground">
          A macrocycle is your full season. It&apos;s built from phases, phases are built from
          weeks, and weeks are built from sessions.
        </p>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between gap-2 p-5">
          {hierarchy.map(({ icon: Icon, label, hint }, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div className="flex flex-1 flex-col items-center gap-1.5 text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-muted">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </div>
                <span className="text-xs font-semibold">{label}</span>
                <span className="text-[10px] text-muted-foreground">{hint}</span>
              </div>
              {i < hierarchy.length - 1 && (
                <span aria-hidden className="shrink-0 text-border">›</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="space-y-1.5">
            <label htmlFor="mc-name" className="text-sm font-medium">Plan name</label>
            <Input
              id="mc-name"
              value={state.name}
              onChange={set('name')}
              placeholder="e.g. Rugby Season 2026"
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="mc-goal" className="text-sm font-medium">
              Event name <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="mc-goal"
              value={state.goalEvent}
              onChange={set('goalEvent')}
              placeholder="e.g. Berlin Champions Cup"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="mc-start" className="text-sm font-medium">Start date</label>
              <Input id="mc-start" type="date" value={state.startDate} onChange={set('startDate')} required />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="mc-target" className="text-sm font-medium">
                Target event date
              </label>
              <Input
                id="mc-target"
                type="date"
                value={state.targetDate}
                onChange={set('targetDate')}
                required
                aria-describedby="mc-target-hint"
              />
              <p id="mc-target-hint" className="text-xs text-muted-foreground">
                Everything in the plan is measured against this day.
              </p>
            </div>
          </div>

          {weeksToEvent !== null && weeksToEvent > 0 && (
            <p className="text-sm font-medium text-primary">
              → That&apos;s about {weeksToEvent} {weeksToEvent === 1 ? 'week' : 'weeks'} to prepare.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
