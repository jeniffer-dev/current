import { Card, CardContent } from '@/components/ui/card';

export type LatestNote = {
  text: string;
  sessionName: string;
  date: string | null;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

export function LatestReflectionCard({ note }: { note: LatestNote | null }) {
  return (
    <Card>
      <CardContent className="p-5 h-full flex flex-col">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
          Latest Reflection
        </p>

        {!note ? (
          <div className="flex-1 flex flex-col justify-center py-3 space-y-1">
            <p className="text-sm text-muted-foreground/60">No reflections yet.</p>
            <p className="text-xs text-muted-foreground/40 leading-relaxed">
              Start capturing notes after training sessions.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-sm leading-relaxed text-foreground/75 italic">
              &ldquo;{note.text}&rdquo;
            </p>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground/55">{note.sessionName}</p>
              {note.date && (
                <p className="text-xs text-muted-foreground/40">{formatDate(note.date)}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
