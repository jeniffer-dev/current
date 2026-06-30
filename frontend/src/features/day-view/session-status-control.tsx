'use client';

import { useState, useTransition } from 'react';
import { Check, Minus } from 'lucide-react';
import { updateSessionStatus } from '@/app/(app)/planner/[trainingDayId]/actions';

type Status = 'planned' | 'completed' | 'skipped';

const badgeStyles: Record<Status, string> = {
  planned:   'bg-muted/60 text-muted-foreground/55',
  completed: 'bg-teal-50 text-teal-700',
  skipped:   'bg-slate-100 text-slate-400',
};

const badgeLabels: Record<Status, string> = {
  planned:   'Planned',
  completed: 'Completed',
  skipped:   'Skipped',
};

export function SessionStatusControl({
  sessionId,
  initialStatus,
  trainingDayId,
}: {
  sessionId: string;
  initialStatus: Status;
  trainingDayId: string;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [isPending, startTransition] = useTransition();

  function handle(next: Status) {
    setStatus(next);
    startTransition(() => updateSessionStatus(sessionId, next, trainingDayId));
  }

  return (
    <div className="flex items-center gap-2.5">
      {/* Status badge */}
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${badgeStyles[status]}`}>
        {status === 'completed' && <Check className="h-3 w-3" />}
        {status === 'skipped'   && <Minus className="h-3 w-3" />}
        {badgeLabels[status]}
      </span>

      {/* Action buttons — minimal, text-only */}
      <div className={`flex items-center gap-0.5 transition-opacity ${isPending ? 'opacity-40 pointer-events-none' : ''}`}>
        {status === 'planned' && (
          <>
            <button
              onClick={() => handle('completed')}
              className="text-xs text-muted-foreground/45 hover:text-teal-700 hover:bg-teal-50 transition-colors px-2 py-1 rounded"
            >
              Complete
            </button>
            <button
              onClick={() => handle('skipped')}
              className="text-xs text-muted-foreground/45 hover:text-slate-600 hover:bg-slate-50 transition-colors px-2 py-1 rounded"
            >
              Skip
            </button>
          </>
        )}
        {status === 'completed' && (
          <button
            onClick={() => handle('planned')}
            className="text-xs text-muted-foreground/35 hover:text-foreground hover:bg-muted transition-colors px-2 py-1 rounded"
          >
            Reopen
          </button>
        )}
        {status === 'skipped' && (
          <>
            <button
              onClick={() => handle('completed')}
              className="text-xs text-muted-foreground/45 hover:text-teal-700 hover:bg-teal-50 transition-colors px-2 py-1 rounded"
            >
              Complete
            </button>
            <button
              onClick={() => handle('planned')}
              className="text-xs text-muted-foreground/35 hover:text-foreground hover:bg-muted transition-colors px-2 py-1 rounded"
            >
              Reopen
            </button>
          </>
        )}
      </div>
    </div>
  );
}
