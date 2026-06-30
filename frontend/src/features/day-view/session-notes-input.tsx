'use client';

import { useState, useTransition } from 'react';
import { Check } from 'lucide-react';
import { updateSessionNotes } from '@/app/(app)/planner/[trainingDayId]/actions';

export function SessionNotesInput({
  sessionId,
  trainingDayId,
  initialNotes,
}: {
  sessionId: string;
  trainingDayId: string;
  initialNotes: string | null;
}) {
  const [notes, setNotes]       = useState(initialNotes ?? '');
  const [saved, setSaved]       = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await updateSessionNotes(sessionId, notes, trainingDayId);
      setSaved(true);
    });
  }

  return (
    <div className="mt-6 pt-5 border-t border-border/35">
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-2.5 block">
        Training Notes
      </label>
      <textarea
        value={notes}
        onChange={e => { setNotes(e.target.value); setSaved(false); }}
        placeholder="How did this session feel?"
        rows={3}
        className="w-full text-sm text-foreground/80 placeholder:text-muted-foreground/30 bg-transparent border border-border/40 rounded-md px-3 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-border/60 transition-colors leading-relaxed"
      />
      <div className="flex items-center gap-3 mt-2.5">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="text-xs text-muted-foreground/55 hover:text-foreground transition-colors px-3 py-1.5 rounded border border-border/40 hover:border-border/60 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving…' : 'Save Note'}
        </button>
        {saved && !isPending && (
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--current-primary)' }}>
            <Check className="h-3 w-3" />
            Saved
          </span>
        )}
      </div>
    </div>
  );
}
