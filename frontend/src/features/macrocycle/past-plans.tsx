'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { activateMacrocycle } from '@/app/(app)/macrocycle/actions';

export type PastPlan = {
  id:         string;
  name:       string;
  start_date: string;
  end_date:   string;
};

function formatRange(start: string, end: string) {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function PastPlans({ plans }: { plans: PastPlan[] }) {
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (plans.length === 0) return null;

  function activate(id: string) {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await activateMacrocycle(id);
      if (result.error) setError(result.error);
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-3 pt-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">Past plans</p>
        <p className="text-sm text-muted-foreground">
          Kept, not deleted. Making one current puts your dashboard, planner and
          performance back on it.
        </p>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      {plans.map(plan => (
        <Card key={plan.id} className="opacity-70">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="min-w-0 space-y-0.5">
              <h3 className="truncate text-base font-semibold tracking-tight">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatRange(plan.start_date, plan.end_date)}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={isPending}
              onClick={() => activate(plan.id)}
            >
              {isPending && pendingId === plan.id ? 'Switching…' : 'Make current'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
