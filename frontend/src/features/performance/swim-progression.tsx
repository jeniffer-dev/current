import { Card, CardContent } from '@/components/ui/card';
import type { ProgressionCard } from './strength-progression';

// ── types (re-exported for page use) ─────────────────────────

export type { ProgressionCard };

type SwimProgressionProps = {
  cards:               ProgressionCard[];
  completedBlockCount: number;
};

// ── helpers ───────────────────────────────────────────────────

function formatValue(value: number, metricType: string, unit: string): string {
  if (metricType === 'time') {
    const totalSecs = Math.round(value);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  const rounded = value % 1 < 0.05 ? Math.round(value) : parseFloat(value.toFixed(1));
  return unit ? `${rounded} ${unit}` : String(rounded);
}

type Delta = { label: string; isImprovement: boolean };

function calcDelta(before: number, after: number, metricType: string, unit: string): Delta | null {
  const diff = after - before;
  if (Math.abs(diff) < 0.01) return null;
  const lowerBetter = metricType === 'time';
  const isImprovement = lowerBetter ? diff < 0 : diff > 0;

  let label: string;
  if (metricType === 'time') {
    const absSecs = Math.round(Math.abs(diff));
    if (absSecs >= 60) {
      const mins = Math.floor(absSecs / 60);
      const secs = absSecs % 60;
      const prefix = diff < 0 ? '-' : '+';
      label = secs > 0 ? `${prefix}${mins}m ${secs}s` : `${prefix}${mins}m`;
    } else {
      label = `${diff < 0 ? '-' : '+'}${absSecs}s`;
    }
  } else {
    const abs = Math.abs(diff);
    const rounded = abs % 1 < 0.05 ? Math.round(abs) : parseFloat(abs.toFixed(1));
    const prefix = diff > 0 ? '+' : '-';
    label = unit ? `${prefix}${rounded} ${unit}` : `${prefix}${rounded}`;
  }

  return { label, isImprovement };
}

// ── component ─────────────────────────────────────────────────

export function SwimProgression({ cards, completedBlockCount }: SwimProgressionProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45 mb-4">
          Swim Progression
        </p>

        {completedBlockCount < 2 ? (
          <p className="text-sm text-muted-foreground/50 leading-snug">
            Complete at least two testing blocks to begin tracking swim progress.
          </p>
        ) : cards.length === 0 ? (
          <p className="text-sm text-muted-foreground/50 leading-snug">
            No swim test results found across completed blocks.
          </p>
        ) : (
          <div>
            {cards.map((card, i) => {
              const delta = calcDelta(card.before, card.after, card.metric_type, card.unit);
              const isLast = i === cards.length - 1;
              return (
                <div
                  key={card.name}
                  className={`flex items-baseline justify-between py-3 gap-4 ${!isLast ? 'border-b border-border/40' : ''}`}
                >
                  <span className="text-sm text-foreground/75 min-w-0 truncate">
                    {card.name}
                  </span>
                  <div className="flex items-baseline gap-4 shrink-0">
                    <span className="text-sm text-muted-foreground/55 tabular-nums">
                      {formatValue(card.before, card.metric_type, card.unit)}
                      <span className="mx-1.5 text-muted-foreground/30">→</span>
                      {formatValue(card.after, card.metric_type, card.unit)}
                    </span>
                    {delta ? (
                      <span className={`text-xs font-medium tabular-nums w-16 text-right ${delta.isImprovement ? 'text-[var(--current-primary)]' : 'text-muted-foreground/40'}`}>
                        {delta.label}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/25 w-16 text-right">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
