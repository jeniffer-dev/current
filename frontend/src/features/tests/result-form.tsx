'use client';

import { useActionState, useState } from 'react';
import { saveTestingResults, type SaveState } from './result-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ── types ─────────────────────────────────────────────────────

export type FormTemplate = {
  id:          string;
  name:        string;
  metric_type: string;
  unit:        string;
};

export type FormSection = {
  label:     string;
  templates: FormTemplate[];
};

export type PrevResult = {
  result_value: number;
  metric_type:  string;
  unit:         string;
};

export type CurrentResult = {
  result_value: number;
  notes:        string | null;
};

type Props = {
  testingBlockId:      string;
  testingSessionId:    string;
  macrocycleId:        string;
  phaseId:             string | null;
  totalBlockTemplates: number;
  sections:            FormSection[];
  previousResults:     Record<string, PrevResult>;
  currentResults:      Record<string, CurrentResult>;
};

// ── helpers ───────────────────────────────────────────────────

function formatPrev(value: number, metricType: string, unit: string): string {
  if (metricType === 'time') {
    const mins = Math.floor(value / 60);
    const secs = Math.round(value % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  const rounded = value % 1 < 0.05 ? Math.round(value) : parseFloat(value.toFixed(1));
  return unit ? `${rounded} ${unit}` : String(rounded);
}

function formatCurrentValue(value: number, metricType: string): string {
  if (metricType === 'time') {
    const mins = Math.floor(value / 60);
    const secs = Math.round(value % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return value % 1 === 0 ? String(value) : parseFloat(value.toFixed(1)).toString();
}

// "in_water" → "In-Water", "strength" → "Strength"
function formatLabel(raw: string): string {
  return raw
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');
}

function getPlaceholder(metricType: string, unit: string): string {
  if (metricType === 'time') return 'e.g. 6:00';
  if (unit === 'level') return 'e.g. 19';
  if (unit === 'kg') return 'e.g. 70';
  return 'e.g. 0';
}

function getUnitHint(metricType: string, unit: string): string {
  if (metricType === 'time') return 'min:sec';
  return unit;
}

const initialState: SaveState = { success: false, error: null };

// ── component ─────────────────────────────────────────────────

export function ResultForm({
  testingBlockId,
  testingSessionId,
  macrocycleId,
  phaseId,
  totalBlockTemplates,
  sections,
  previousResults,
  currentResults,
}: Props) {
  const [state, action, isPending] = useActionState(saveTestingResults, initialState);
  const [activeTab, setActiveTab] = useState(sections[0]?.label ?? '');

  return (
    <form action={action} className="space-y-4">

      {/* Context hidden fields */}
      <input type="hidden" name="testing_block_id"      value={testingBlockId} />
      <input type="hidden" name="testing_session_id"    value={testingSessionId} />
      <input type="hidden" name="macrocycle_id"         value={macrocycleId} />
      <input type="hidden" name="total_block_templates" value={totalBlockTemplates} />
      {phaseId && <input type="hidden" name="phase_id"  value={phaseId} />}

      {/* Tab switcher — only shown when multiple categories */}
      {sections.length > 1 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {sections.map(s => (
              <TabsTrigger key={s.label} value={s.label}>
                {formatLabel(s.label)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/*
        All section cards are rendered — only the active one is visible.
        CSS `hidden` keeps inputs in the DOM so the form submits all values,
        not just the currently visible section.
      */}
      {sections.map(section => (
        <div key={section.label} className={section.label === activeTab ? '' : 'hidden'}>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground/45 mb-4">
                {formatLabel(section.label)}
              </p>

              {section.templates.map((template, i) => {
                const prev    = previousResults[template.id] ?? null;
                const current = currentResults[template.id]  ?? null;
                const isLast  = i === section.templates.length - 1;
                const hint    = getUnitHint(template.metric_type, template.unit);
                const ph      = getPlaceholder(template.metric_type, template.unit);

                return (
                  <div
                    key={template.id}
                    className={`py-4 ${!isLast ? 'border-b border-border/40' : ''}`}
                  >
                    {/* Per-template hidden fields */}
                    <input type="hidden" name="template_id"                  value={template.id} />
                    <input type="hidden" name={`metric_type_${template.id}`} value={template.metric_type} />

                    {/* Name + previous directly below */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-foreground/80">{template.name}</p>
                      <p className="text-xs text-muted-foreground/45 mt-0.5">
                        {prev
                          ? `Previous · ${formatPrev(prev.result_value, prev.metric_type, prev.unit)}`
                          : 'Baseline'
                        }
                      </p>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor={`result_${template.id}`}
                          className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1.5 block"
                        >
                          Result
                        </label>
                        <div className="relative flex items-center">
                          <Input
                            id={`result_${template.id}`}
                            name={`result_${template.id}`}
                            placeholder={ph}
                            defaultValue={
                              current
                                ? formatCurrentValue(current.result_value, template.metric_type)
                                : ''
                            }
                            className={`h-9 text-sm ${hint ? 'pr-14' : ''}`}
                          />
                          {hint && (
                            <span className="absolute right-3 text-xs text-muted-foreground/35 pointer-events-none select-none">
                              {hint}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor={`notes_${template.id}`}
                          className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1.5 block"
                        >
                          Notes
                        </label>
                        <Input
                          id={`notes_${template.id}`}
                          name={`notes_${template.id}`}
                          placeholder="Optional"
                          defaultValue={current?.notes ?? ''}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      ))}

      {/* Save */}
      <div className="flex items-center gap-4 pt-1 pb-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save Results'}
        </Button>
        {state.success && !isPending && (
          <p className="text-xs text-[var(--current-primary)]">Results Saved</p>
        )}
        {state.error && !isPending && (
          <p className="text-xs text-destructive">{state.error}</p>
        )}
      </div>

    </form>
  );
}
