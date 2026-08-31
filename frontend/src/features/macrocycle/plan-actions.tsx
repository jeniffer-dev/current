'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  archiveMacrocycle,
  deleteMacrocycle,
  unarchiveMacrocycle,
} from '@/app/(app)/macrocycle/actions';

export type PlanWeight = {
  /** How much training stands behind this plan. */
  trainingDays: number;
  results:      number;
};

/**
 * What can be done to one plan.
 *
 * Deleting is offered only for a plan nobody has trained in. That is not
 * a courtesy — training days cascade from a macrocycle, and sessions and
 * logged sets cascade from them, so deleting a trained plan would take a
 * season with it. The database refuses; this hides the button so nobody
 * has to find out that way.
 */
export function PlanActions({
  id,
  name,
  archived,
  weight,
}: {
  id:       string;
  name:     string;
  archived: boolean;
  weight:   PlanWeight;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const hasTraining = weight.trainingDays > 0 || weight.results > 0;

  function run(action: () => Promise<{ error: string | null }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) { setError(result.error); return; }
      setConfirming(false);
      router.refresh();
    });
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-2">
        <p className="text-right text-xs text-muted-foreground">
          Delete <span className="font-medium text-foreground">{name}</span> and its phases?
          Nothing was trained in it.
        </p>
        <div className="flex items-center gap-1.5">
          <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
            Keep it
          </Button>
          <Button
            type="button" variant="destructive" size="sm"
            disabled={pending}
            onClick={() => run(() => deleteMacrocycle({ id }))}
          >
            {pending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
        {error && <p role="alert" className="text-xs font-medium text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-1">
        {archived ? (
          <Button
            type="button" variant="outline" size="sm"
            disabled={pending}
            onClick={() => run(() => unarchiveMacrocycle({ id }))}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {pending ? 'Restoring…' : 'Restore'}
          </Button>
        ) : (
          <Button
            type="button" variant="ghost" size="sm"
            className="text-muted-foreground"
            disabled={pending}
            onClick={() => run(() => archiveMacrocycle({ id }))}
          >
            <Archive className="h-3.5 w-3.5" />
            {pending ? 'Archiving…' : 'Archive'}
          </Button>
        )}

        {!hasTraining && (
          <Button
            type="button" variant="ghost" size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setConfirming(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        )}
      </div>

      {hasTraining && !archived && (
        <p className="text-right text-[11px] text-muted-foreground/60">
          {weight.trainingDays} training {weight.trainingDays === 1 ? 'day' : 'days'} behind it —
          archive keeps them
        </p>
      )}

      {error && <p role="alert" className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
