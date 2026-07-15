'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

export type ExerciseEntry = {
  date:         string;
  weight:       number | null;
  reps:         number | null;
  estimated1RM: number | null;
};

export type ExerciseProgression = {
  exerciseName: string;
  entries:      ExerciseEntry[];
};

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
  });
}

function formatSet(weight: number | null, reps: number | null): string {
  if (weight != null && reps != null) return `${weight} kg × ${reps}`;
  if (weight != null)                 return `${weight} kg`;
  if (reps != null)                   return `× ${reps}`;
  return '—';
}

// ── chart ─────────────────────────────────────────────────────

function ProgressionChart({ entries }: { entries: ExerciseEntry[] }) {
  const validEntries = entries.filter(e => e.estimated1RM !== null);
  if (validEntries.length < 2) return null;

  // Chart expects chronological order (oldest left → newest right)
  const chartData = [...entries].reverse();

  const values = validEntries.map(e => e.estimated1RM as number);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const pad    = Math.max((maxVal - minVal) * 0.1, 3);
  const domain: [number, number] = [Math.floor(minVal - pad), Math.ceil(maxVal + pad)];

  return (
    <div className="h-36 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid
            vertical={false}
            stroke="currentColor"
            strokeOpacity={0.07}
          />
          <XAxis
            dataKey="date"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tickFormatter={(d: any) => formatDate(String(d))}
            tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.35 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={domain}
            tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.35 }}
            axisLine={false}
            tickLine={false}
            width={36}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tickFormatter={(v: any) => String(v)}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content={(props: any) => {
              if (!props.active || !props.payload?.length) return null;
              const entry = props.payload[0].payload as ExerciseEntry;
              return (
                <div className="bg-background border border-border/40 rounded-md px-3 py-2 text-xs shadow-sm">
                  <p className="text-muted-foreground/50 mb-1">{formatDate(entry.date)}</p>
                  {entry.weight != null && entry.reps != null && (
                    <p className="font-medium tabular-nums">{entry.weight} kg × {entry.reps}</p>
                  )}
                  {entry.estimated1RM != null && (
                    <p className="text-muted-foreground/55 mt-0.5 tabular-nums">
                      ~{entry.estimated1RM} kg est. 1RM
                    </p>
                  )}
                </div>
              );
            }}
            cursor={{ stroke: 'currentColor', strokeOpacity: 0.08 }}
          />
          <Line
            type="monotone"
            dataKey="estimated1RM"
            stroke="var(--current-primary)"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: 'var(--current-primary)', strokeWidth: 0 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── component ─────────────────────────────────────────────────

export function TrainingProgression({ progressions }: { progressions: ExerciseProgression[] }) {
  const [selectedName, setSelectedName] = useState(progressions[0]?.exerciseName ?? '');

  if (progressions.length === 0) {
    return (
      <Card>
        <CardContent className="p-5 sm:p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45 mb-4">Training Progression</p>
          <p className="text-sm text-muted-foreground/50">No training logs yet.</p>
          <p className="text-xs text-muted-foreground/40 mt-1">Start logging top sets from Day View.</p>
        </CardContent>
      </Card>
    );
  }

  const selected = progressions.find(p => p.exerciseName === selectedName) ?? progressions[0];
  const latest   = selected.entries[0] ?? null;

  return (
    <Card>
      <CardContent className="p-5 sm:p-6 space-y-5">

        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">Training Progression</p>

        {/* Exercise selector */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/35 mb-2">Exercise</p>
          <div className="relative inline-block">
            <select
              value={selectedName}
              onChange={e => setSelectedName(e.target.value)}
              className="text-sm font-medium bg-transparent border border-border/40 rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-border/60 cursor-pointer appearance-none"
            >
              {progressions.map(p => (
                <option key={p.exerciseName} value={p.exerciseName}>{p.exerciseName}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
          </div>
        </div>

        {/* Latest top set highlight */}
        {latest && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/35 mb-2">Latest Top Set</p>
            <p className="text-base font-semibold tabular-nums">{formatSet(latest.weight, latest.reps)}</p>
            <p className="text-xs text-muted-foreground/40 mt-0.5">{formatDate(latest.date)}</p>
          </div>
        )}

        {/* 1RM trend chart — only when ≥4 sessions with estimated1RM */}
        <ProgressionChart entries={selected.entries} />

        {/* Timeline */}
        <div className="border-t border-border/30 pt-5 space-y-4">
          {selected.entries.map((entry, i) => (
            <div key={i} className={i > 0 ? 'border-t border-border/20 pt-4' : ''}>
              <p className="text-xs text-muted-foreground/40 mb-0.5">{formatDate(entry.date)}</p>
              <p className="text-sm font-medium tabular-nums">{formatSet(entry.weight, entry.reps)}</p>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}
