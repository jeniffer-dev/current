'use client';

import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { phaseColor } from '@/lib/phase-catalog';
import { phaseBoundaries, formatTestDate } from '@/lib/test-schedule';
import {
  batteryKindLabel,
  dateAnchors,
  hasPhaseAnchor,
  includedPhases,
  phaseName,
  schedulableBatteries,
  type BatteryKind,
  type BuilderAction,
  type BuilderBattery,
  type BuilderState,
  type TestTemplate,
} from './state';

/**
 * What a test measures, said the way the athlete will read the result.
 * The library already knows this — metric_type and unit are columns on
 * test_templates — so it is reported, never asked again.
 */
function metricLabel(template: TestTemplate): string {
  switch (template.metric_type) {
    case 'weight': return template.unit ?? 'kg';
    case 'time':   return 'mm:ss';
    case 'level':  return 'level';
    default:       return template.unit ?? template.metric_type;
  }
}

const kindOptions: { kind: BatteryKind; label: string }[] = [
  { kind: 'in_water', label: 'Water' },
  { kind: 'strength', label: 'Gym' },
  { kind: 'mixed',    label: 'Mixed' },
];

function BatteryEditor({
  state,
  battery,
  dispatch,
}: {
  state:    BuilderState;
  battery:  BuilderBattery;
  dispatch: (action: BuilderAction) => void;
}) {
  const [customDate, setCustomDate] = useState('');
  const phases = includedPhases(state);

  // The dates the athlete will actually get, computed from the plan they
  // have built so far — shown before the plan exists, so a phase anchor
  // is a date and not a promise.
  const bounds = phaseBoundaries(state.startDate, phases.map(p => p.weeks));

  // A test can sit in a battery of another kind: an athlete may want one
  // land test inside a water session. The library is filtered by the
  // battery's kind first, with everything else still reachable below.
  const matching = state.templates.filter(t => t.category === battery.kind);
  const others   = state.templates.filter(t => t.category !== battery.kind);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={battery.name}
          onChange={e => dispatch({ type: 'setBatteryName', uid: battery.uid, value: e.target.value })}
          aria-label="Battery name"
          className="h-9 max-w-[280px] font-semibold"
        />
        <Button
          type="button" variant="ghost" size="sm"
          className="text-muted-foreground"
          onClick={() => dispatch({ type: 'removeBattery', uid: battery.uid })}
        >
          <X className="h-3.5 w-3.5" />
          Remove
        </Button>
      </div>

      {/* ── which tests ─────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Tests in this battery
        </p>
        {state.templates.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Your test library is empty, so there is nothing to schedule yet.
          </p>
        ) : (
          <div className="space-y-1">
            {[...matching, ...others].map(template => {
              const on = battery.templateIds.includes(template.id);
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => dispatch({ type: 'toggleTemplate', uid: battery.uid, templateId: template.id })}
                  aria-pressed={on}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                    on ? 'border-foreground/25 bg-muted/70' : 'border-border hover:bg-muted/40'
                  }`}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px]"
                    style={{ borderColor: on ? 'hsl(var(--foreground))' : 'hsl(var(--border))' }}
                  >
                    {on && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{template.name}</span>
                  <span className="shrink-0 rounded-full bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {metricLabel(template)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── when it happens ─────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          When it happens
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Anchor it to a phase and it moves if you reshape the plan. Add a date and it stays
          put — a competition or a booking is not yours to move.
        </p>

        <div className="space-y-1.5 pt-1">
          {phases.map((phase, i) => (
            <div key={phase.uid} className="flex flex-wrap items-center gap-2">
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-sm"
                style={{ backgroundColor: phaseColor(phase.type) }}
              />
              <span className="min-w-[130px] flex-1 truncate text-[13px]">{phaseName(phase)}</span>
              {(['start', 'end'] as const).map(position => {
                const on   = hasPhaseAnchor(battery, phase.uid, position);
                const date = position === 'start' ? bounds[i]?.start : bounds[i]?.end;
                return (
                  <button
                    key={position}
                    type="button"
                    onClick={() => dispatch({
                      type: 'togglePhaseAnchor', uid: battery.uid, phaseUid: phase.uid, position,
                    })}
                    aria-pressed={on}
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      on ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-muted'
                    }`}
                  >
                    {position === 'start' ? 'Start' : 'End'}
                    {date && (
                      <span className={on ? 'ml-1.5 opacity-75' : 'ml-1.5 text-muted-foreground'}>
                        {formatTestDate(date)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Input
            type="date"
            value={customDate}
            min={state.startDate}
            onChange={e => setCustomDate(e.target.value)}
            aria-label="Add your own testing date"
            className="h-8 max-w-[170px] text-[13px]"
          />
          <Button
            type="button" variant="outline" size="sm"
            disabled={!customDate}
            onClick={() => {
              dispatch({ type: 'addDateAnchor', uid: battery.uid, date: customDate });
              setCustomDate('');
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add date
          </Button>
        </div>

        {dateAnchors(battery).length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {dateAnchors(battery).map(date => (
              <span
                key={date}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted py-1 pl-2.5 pr-1 text-[11px] font-medium"
              >
                {formatTestDate(date)}
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'removeDateAnchor', uid: battery.uid, date })}
                  aria-label={`Remove ${date}`}
                  className="rounded-full p-0.5 hover:bg-background"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TestsStep({
  state,
  dispatch,
}: {
  state:    BuilderState;
  dispatch: (action: BuilderAction) => void;
}) {
  const active      = state.batteries.find(b => b.uid === state.activeBatteryUid) ?? state.batteries[0] ?? null;
  const schedulable = schedulableBatteries(state);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Testing</h1>
        <p className="max-w-[540px] text-sm leading-relaxed text-muted-foreground">
          A battery is a set of tests you repeat through the season, so you can see the same
          numbers move. Each one carries its own dates — gym testing might only bracket
          Accumulation while water testing runs all the way through.
        </p>
      </div>

      <div className="-mx-1 flex flex-wrap gap-2 px-1">
        {state.batteries.map(battery => {
          const on = battery.uid === active?.uid;
          return (
            <button
              key={battery.uid}
              type="button"
              onClick={() => dispatch({ type: 'selectBattery', uid: battery.uid })}
              aria-current={on ? 'true' : undefined}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                on ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-muted'
              }`}
            >
              {battery.name.trim() || batteryKindLabel(battery.kind)}
              <span className={on ? 'opacity-70' : 'text-muted-foreground'}>
                {battery.anchors.length}×
              </span>
            </button>
          );
        })}

        {kindOptions.map(option => (
          <button
            key={option.kind}
            type="button"
            onClick={() => dispatch({ type: 'addBattery', kind: option.kind })}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <Plus className="h-3 w-3" />
            {option.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="px-6 py-5">
          {active ? (
            <BatteryEditor state={state} battery={active} dispatch={dispatch} />
          ) : (
            <p className="py-4 text-sm text-muted-foreground">
              No testing in this plan. Add a battery above, or create the plan without one —
              you can test whenever you decide to.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Testing is optional, so this reports rather than warns. */}
      <div className="rounded-xl bg-muted px-5 py-3.5">
        <p className="text-sm font-medium leading-relaxed text-muted-foreground">
          {schedulable.length === 0
            ? 'Nothing is scheduled yet — a battery needs at least one test and one date.'
            : `${schedulable.length} ${schedulable.length === 1 ? 'battery' : 'batteries'} scheduled, ` +
              `${schedulable.reduce((n, b) => n + b.anchors.length, 0)} testing points across the season.`}
        </p>
      </div>
    </div>
  );
}
