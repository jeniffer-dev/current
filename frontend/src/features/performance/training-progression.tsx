'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export type ExerciseEntry = {
  date:   string;
  weight: number | null;
  reps:   number | null;
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
