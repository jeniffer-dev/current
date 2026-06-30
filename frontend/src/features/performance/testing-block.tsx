import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// ── types ─────────────────────────────────────────────────────

export type BlockInfo = {
  id:            string;
  weekNumber:    number;
  purpose:       string;
  scheduledDate: string | null;
  status:        'pending' | 'in_progress' | 'completed';
  updatedAt:     string;
};

type TestingBlockProps = {
  nextBlock:          BlockInfo | null;
  lastCompletedBlock: BlockInfo | null;
};

// ── helpers ───────────────────────────────────────────────────

const blockStatusStyles: Record<string, string> = {
  pending:     'bg-teal-50 text-teal-700',
  in_progress: 'bg-blue-50 text-blue-600',
  completed:   'bg-emerald-50 text-emerald-700',
};

const blockStatusLabels: Record<string, string> = {
  pending:     'next',
  in_progress: 'in progress',
  completed:   'completed',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

function formatTimestamp(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

// ── component ─────────────────────────────────────────────────

export function TestingBlock({ nextBlock, lastCompletedBlock }: TestingBlockProps) {
  if (!nextBlock && !lastCompletedBlock) {
    return (
      <Card>
        <CardContent className="p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45 mb-3">
            Testing Checkpoint
          </p>
          <p className="text-sm text-muted-foreground/50">
            No testing blocks scheduled yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45 mb-4">
          Testing Checkpoint
        </p>

        <div className="space-y-5">

          {/* Next / Active block */}
          {nextBlock && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/35 mb-2">
                {nextBlock.status === 'in_progress' ? 'In Progress' : 'Next Testing Block'}
              </p>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground/80">
                    Week {nextBlock.weekNumber}
                  </p>
                  <p className="text-xs text-muted-foreground/55 mt-0.5">
                    {nextBlock.purpose}
                  </p>
                  {nextBlock.scheduledDate && (
                    <p className="text-xs text-muted-foreground/40 mt-0.5">
                      {formatDate(nextBlock.scheduledDate)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium lowercase tracking-wide ${blockStatusStyles[nextBlock.status] ?? blockStatusStyles.pending}`}>
                    {blockStatusLabels[nextBlock.status] ?? nextBlock.status}
                  </span>
                  <Link
                    href={`/tests/week-${nextBlock.weekNumber}`}
                    className="text-muted-foreground/40 hover:text-foreground/60 transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Last completed block */}
          {lastCompletedBlock && (
            <div className={nextBlock ? 'border-t border-border/30 pt-5' : ''}>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/35 mb-2">
                Last Completed Block
              </p>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground/80">
                    Week {lastCompletedBlock.weekNumber}
                  </p>
                  <p className="text-xs text-muted-foreground/40 mt-0.5">
                    Completed {formatTimestamp(lastCompletedBlock.updatedAt)}
                  </p>
                </div>
                <Link
                  href={`/tests/week-${lastCompletedBlock.weekNumber}`}
                  className="text-muted-foreground/40 hover:text-foreground/60 transition-colors pt-0.5"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}
