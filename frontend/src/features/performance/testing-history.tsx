import { Card, CardContent } from '@/components/ui/card';

export type TestingMetricHistory = {
  name:        string;
  unit:        string;
  metric_type: string;
  entries: {
    weekNumber: number;
    value:      number | null;
  }[];
};

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
  const displayed = value % 1 === 0 ? value : parseFloat(value.toFixed(1));
  return unit ? `${displayed} ${unit}` : String(displayed);
}

export function TestingHistory({ metrics }: { metrics: TestingMetricHistory[] }) {
  if (metrics.length === 0) {
    return (
      <Card>
        <CardContent className="p-5 sm:p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45 mb-4">Testing History</p>
          <p className="text-sm text-muted-foreground/50">No test results recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45 mb-6">Testing History</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
          {metrics.map((metric) => (
            <div key={metric.name}>
              <p className="text-sm font-semibold mb-3">{metric.name}</p>
              <div className="space-y-2">
                {metric.entries.map((entry) => (
                  <div key={entry.weekNumber} className="flex items-baseline justify-between gap-4">
                    <span className="text-xs text-muted-foreground/40 shrink-0">Week {entry.weekNumber}</span>
                    {entry.value != null
                      ? <span className="text-xs font-medium tabular-nums">{formatValue(entry.value, metric.metric_type, metric.unit)}</span>
                      : <span className="text-xs text-muted-foreground/25">—</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
