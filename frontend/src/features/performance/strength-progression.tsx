import { Card, CardContent } from '@/components/ui/card';

// ── types ─────────────────────────────────────────────────────

export type ProgressionCard = {
  name:        string;
  metric_type: string;
  unit:        string;
  before:      number;
  after:       number;
};

type StrengthProgressionProps = {
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

function calcDelta(before: number, after: number, metricType: string): Delta | null {
  if (before === 0) return null;
  const diff = after - before;
  if (Math.abs(diff) < 0.01) return null;
  const lowerBetter = metricType === 'time';
  const isImprovement = lowerBetter ? diff < 0 : diff > 0;
  const pct = Math.abs((diff / before) * 100);
  const rounded = pct < 1 ? parseFloat(pct.toFixed(1)) : Math.round(pct);
  const sign = diff > 0 ? '+' : diff < 0 ? '-' : '';
  return { label: `${sign}${rounded}%`, isImprovement };
}

// ── component ─────────────────────────────────────────────────

export function StrengthProgression({ cards, completedBlockCount }: StrengthProgressionProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45 mb-4">
          Strength Progression
        </p>

        {completedBlockCount < 2 ? (
          <p className="text-sm text-muted-foreground/50 leading-snug">
            Complete at least two testing blocks to begin tracking strength progress.
          </p>
        ) : cards.length === 0 ? (
          <p className="text-sm text-muted-foreground/50 leading-snug">
            No strength test results found across completed blocks.
          </p>
        ) : (
          <div>
            {cards.map((card, i) => {
              const delta = calcDelta(card.before, card.after, card.metric_type);
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
                      <span className={`text-xs font-medium tabular-nums w-14 text-right ${delta.isImprovement ? 'text-[var(--current-primary)]' : 'text-muted-foreground/40'}`}>
                        {delta.label}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/25 w-14 text-right">—</span>
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
