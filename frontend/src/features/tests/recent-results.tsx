import { Card, CardContent } from '@/components/ui/card';

// ── types ─────────────────────────────────────────────────────

export type BlockResult = {
  id:          string;
  name:        string;
  category:    string;
  metric_type: string;
  result_value: number;
  unit:        string;
};

export type TestingHistoryBlock = {
  id:             string;
  week_number:    number;
  purpose:        string;
  scheduled_date: string | null;
  results:        BlockResult[];
};

// ── helpers ───────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

function formatValue(value: number, metricType: string, unit: string): string {
  if (metricType === 'time') {
    if (value >= 60) {
      const mins = Math.floor(value / 60);
      const secs = Math.round(value % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${parseFloat(value.toFixed(1))}s`;
  }
  if (unit === 'level') return String(Math.round(value));
  const rounded = value % 1 < 0.05 ? Math.round(value) : parseFloat(value.toFixed(1));
  return unit ? `${rounded} ${unit}` : String(rounded);
}

// 'in_water' → 'In-Water', 'strength' → 'Strength'
function formatCategoryLabel(raw: string): string {
  return raw
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');
}

const CATEGORY_ORDER = ['in_water', 'strength'];

function sortCategories(cats: string[]): string[] {
  return [...cats].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

// ── component ─────────────────────────────────────────────────

export function TestingHistory({ blocks }: { blocks: TestingHistoryBlock[] }) {
  if (blocks.length === 0) {
    return (
      <Card>
        <CardContent className="p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45 mb-3">
            Testing History
          </p>
          <p className="text-sm text-foreground/55">No testing results recorded yet.</p>
          <p className="text-xs text-muted-foreground/45 mt-1">
            Complete your first testing block to begin tracking performance.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-widest text-muted-foreground/45 px-0.5">
        Testing History
      </p>

      {blocks.map(block => {
        // Group results by category
        const catMap = new Map<string, BlockResult[]>();
        for (const r of block.results) {
          if (!catMap.has(r.category)) catMap.set(r.category, []);
          catMap.get(r.category)!.push(r);
        }
        const sortedCats = sortCategories([...catMap.keys()]);

        return (
          <Card key={block.id}>
            <CardContent className="p-5 sm:p-6">

              {/* Block header */}
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">
                  Week {block.week_number}
                </p>
                <p className="text-base font-semibold tracking-tight">
                  {block.purpose}
                </p>
                {block.scheduled_date && (
                  <p className="text-xs text-muted-foreground/45 mt-1">
                    {formatDate(block.scheduled_date)}
                  </p>
                )}
              </div>

              {/* Category sections */}
              <div className="space-y-6">
                {sortedCats.map((cat, ci) => {
                  const items = catMap.get(cat)!;
                  const isLast = ci === sortedCats.length - 1;
                  return (
                    <div key={cat} className={!isLast ? 'pb-6 border-b border-border/30' : ''}>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-3">
                        {formatCategoryLabel(cat)}
                      </p>
                      <div>
                        {items.map((result, i) => (
                          <div
                            key={result.id}
                            className={`flex items-baseline justify-between gap-4 py-2.5 ${
                              i < items.length - 1 ? 'border-b border-border/25' : ''
                            }`}
                          >
                            <span className="text-sm text-foreground/70 min-w-0 truncate">
                              {result.name}
                            </span>
                            <span className="text-sm font-semibold tabular-nums shrink-0">
                              {formatValue(result.result_value, result.metric_type, result.unit)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
