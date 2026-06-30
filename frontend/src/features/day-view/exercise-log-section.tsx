'use client';

import { useState, useTransition } from 'react';
import { upsertExerciseLog } from '@/app/(app)/planner/[trainingDayId]/actions';

export type ExerciseLog = {
  id:          string;
  exercise_id: string;
  training_day_session_id: string;
  weight:      number | null;
  reps:        number | null;
};

function formatTopSet(weight: number | null, reps: number | null): string {
  if (weight != null && reps != null) return `${weight} kg × ${reps}`;
  if (weight != null)                 return `${weight} kg`;
  if (reps != null)                   return `× ${reps}`;
  return '—';
}

export function ExerciseLogSection({
  exerciseId,
  sessionId,
  trainingDayId,
  existingLog,
}: {
  exerciseId:    string;
  sessionId:     string;
  trainingDayId: string;
  existingLog:   ExerciseLog | null;
}) {
  const [log, setLog]           = useState<ExerciseLog | null>(existingLog);
  const [open, setOpen]         = useState(false);
  const [weight, setWeight]     = useState('');
  const [reps, setReps]         = useState('');
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setWeight(log?.weight?.toString() ?? '');
    setReps(log?.reps?.toString()     ?? '');
    setOpen(true);
  }

  function handleCancel() {
    setOpen(false);
  }

  function handleSave() {
    const w = weight.trim() ? parseFloat(weight) : null;
    const r = reps.trim()   ? parseInt(reps, 10) : null;
    startTransition(async () => {
      const { logId } = await upsertExerciseLog(
        sessionId, exerciseId, w, r, trainingDayId, log?.id,
      );
      setLog({ id: logId, exercise_id: exerciseId, training_day_session_id: sessionId, weight: w, reps: r });
      setOpen(false);
    });
  }

  // ── editing form ──────────────────────────────────────────────
  if (open) {
    return (
      <div className="mt-3 space-y-2.5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">Top Set</p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="—"
              min="0"
              step="0.5"
              className="w-16 h-7 text-sm text-center border border-border/50 rounded px-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-border/60 tabular-nums"
            />
            <span className="text-xs text-muted-foreground/45">kg</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={reps}
              onChange={e => setReps(e.target.value)}
              placeholder="—"
              min="0"
              step="1"
              className="w-12 h-7 text-sm text-center border border-border/50 rounded px-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-border/60 tabular-nums"
            />
            <span className="text-xs text-muted-foreground/45">reps</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="text-xs px-2.5 py-1 rounded border border-border/40 text-muted-foreground/60 hover:text-foreground hover:border-border/70 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── saved display ─────────────────────────────────────────────
  if (log && (log.weight != null || log.reps != null)) {
    return (
      <div className="mt-2 flex items-center gap-2.5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">Top Set</p>
        <p className="text-xs font-medium tabular-nums">{formatTopSet(log.weight, log.reps)}</p>
        <button
          type="button"
          onClick={handleOpen}
          className="text-xs text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
        >
          Edit
        </button>
      </div>
    );
  }

  // ── no log yet ────────────────────────────────────────────────
  return (
    <button
      type="button"
      onClick={handleOpen}
      className="mt-2 text-xs text-muted-foreground/30 hover:text-muted-foreground/55 transition-colors"
    >
      Log top set
    </button>
  );
}
