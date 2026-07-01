'use client';

import { useEffect, useMemo, useOptimistic, useState, useTransition } from 'react';
import Link from 'next/link';
import { Dumbbell, Waves, Leaf, Circle, CheckCircle2, X, Check, Minus, Plus, Search, Star, FlaskConical, Activity } from 'lucide-react';
import { planSession, unscheduleSession } from '@/app/(app)/planner/actions';
import { updateSessionStatus } from '@/app/(app)/planner/[trainingDayId]/actions';
import { recurringActivities } from './recurring-activities';
import { conditioningSessions, conditioningTypeForPhase, conditioningLabel } from './conditioning-catalog';

type SessionItem = {
  id:           string;
  session_name: string;
  session_type: string;
  status:       'planned' | 'completed' | 'skipped';
  template_id:  string | null;
};

type BoardDay = {
  dateStr:       string;
  label:         string;
  sublabel:      string;
  isToday:       boolean;
  trainingDayId: string | null;
  sessions:      SessionItem[];
};

type CatalogItem = {
  templateId:  string;
  sessionName: string;
  sessionType: string;
  recommended: boolean;
};

type Selection = {
  sessionName: string;
  sessionType: string;
  templateId:  string | null;
};

type PlanItem = {
  session:       SessionItem;
  trainingDayId: string | null;
  dateStr:       string;
};

type Props = {
  weekDays:     BoardDay[];
  catalog:      CatalogItem[];
  testSessions: TestSessionItem[];
  weekDates:    string[];
  macrocycleId: string;
  phaseId:      string | null;
  phaseType:    string | null;
};

type OptimisticAction =
  | { type: 'assign'; dateStr: string; session: SessionItem }
  | { type: 'remove'; sessionId: string }
  | { type: 'updateStatus'; sessionId: string; status: SessionItem['status'] };

type Tab = 'gym' | 'swim' | 'other' | 'conditioning' | 'test';

type TestSessionItem = {
  templateId:  string;
  sessionName: string;
  dateLabel:   string;
};

function SessionIcon({ sessionType, sessionName }: { sessionType: string; sessionName?: string }) {
  const lower = sessionType.toLowerCase();
  if (lower.includes('swim')) {
    return <Waves className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--current-primary)' }} />;
  }
  if (lower.includes('recover')) {
    return <Leaf className="h-3.5 w-3.5 shrink-0 text-teal-400" />;
  }
  if (lower.includes('gym')) {
    return <Dumbbell className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--current-load)' }} />;
  }
  if (lower.includes('conditioning')) {
    return <Activity className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--current-load)' }} />;
  }
  if (sessionName?.toLowerCase().includes('uwr')) {
    return <span className="text-[13px] leading-none shrink-0" aria-label="UWR">🤿</span>;
  }
  if (lower.includes('test')) {
    return <FlaskConical className="h-3.5 w-3.5 shrink-0 text-violet-400" />;
  }
  return <Circle className="h-3 w-3 shrink-0 text-muted-foreground/35" />;
}

function StatusDot({ status }: { status: SessionItem['status'] }) {
  if (status === 'completed') return <Check className="h-3 w-3 shrink-0 text-teal-600" />;
  if (status === 'skipped')   return <Minus className="h-3 w-3 shrink-0 text-slate-400" />;
  return <Circle className="h-2.5 w-2.5 shrink-0 text-muted-foreground/25" />;
}

export function WeekPlannerBoard({
  weekDays,
  catalog,
  testSessions,
  weekDates,
  macrocycleId,
  phaseId,
  phaseType,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [addingDateStr, setAddingDateStr] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('gym');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const [days, applyOptimistic] = useOptimistic<BoardDay[], OptimisticAction>(
    weekDays,
    (state, action) => {
      if (action.type === 'assign') {
        return state.map(d =>
          d.dateStr === action.dateStr
            ? { ...d, sessions: [...d.sessions, action.session] }
            : d,
        );
      }
      if (action.type === 'remove') {
        return state.map(d => ({
          ...d,
          sessions: d.sessions.filter(s => s.id !== action.sessionId),
        }));
      }
      return state.map(d => ({
        ...d,
        sessions: d.sessions.map(s =>
          s.id === action.sessionId ? { ...s, status: action.status } : s
        ),
      }));
    },
  );

  // ── weekly plan (source of truth for summary + limits) ──────
  const weekSessions = useMemo<PlanItem[]>(
    () =>
      days.flatMap(d =>
        d.sessions.map(s => ({
          session:       s,
          trainingDayId: d.trainingDayId,
          dateStr:       d.dateStr,
        })),
      ),
    [days],
  );

  const activeDaySessions = useMemo(
    () => (addingDateStr ? weekSessions.filter(w => w.dateStr === addingDateStr) : []),
    [weekSessions, addingDateStr],
  );

  const dayHasGym  = activeDaySessions.some(w => w.session.session_type === 'gym');
  const dayHasSwim = activeDaySessions.some(w => w.session.session_type === 'swim');

  const scheduledTemplateIds = useMemo(() => {
    const set = new Set<string>();
    for (const w of weekSessions) {
      if (w.session.template_id) set.add(w.session.template_id);
    }
    return set;
  }, [weekSessions]);

  const activeDay = days.find(d => d.dateStr === addingDateStr) ?? null;

  function openAdd(dateStr: string) {
    setAddingDateStr(dateStr);
    setQuery('');
    setTab('gym');
  }

  function closeAdd() {
    setAddingDateStr(null);
    setQuery('');
  }

  useEffect(() => {
    if (!addingDateStr) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeAdd();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [addingDateStr]);

  useEffect(() => {
    if (!addingDateStr) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [addingDateStr]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  function assign(dateStr: string, selection: Selection) {
    const session: SessionItem = {
      id:           `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      session_name: selection.sessionName,
      session_type: selection.sessionType,
      status:       'planned',
      template_id:  selection.templateId,
    };

    // Keep the modal open so several sessions (gym + swim + other) can be
    // added in one pass. The plan summary and tab locks update live.
    startTransition(async () => {
      applyOptimistic({ type: 'assign', dateStr, session });
      try {
        await planSession({
          sessionName:  selection.sessionName,
          date:         dateStr,
          macrocycleId,
          phaseId,
          sessionType:  selection.sessionType,
          templateId:   selection.templateId,
          weekDates,
        });
        setToast(`${selection.sessionName} added`);
      } catch (e) {
        applyOptimistic({ type: 'remove', sessionId: session.id });
        setToast(e instanceof Error ? e.message : 'Could not add session');
      }
    });
  }

  function unschedule(trainingDayId: string | null, session: SessionItem) {
    if (!trainingDayId || session.id.startsWith('temp-')) return;
    startTransition(async () => {
      applyOptimistic({ type: 'remove', sessionId: session.id });
      try {
        await unscheduleSession({ sessionId: session.id, trainingDayId });
        setToast(`${session.session_name} removed`);
      } catch (e) {
        setToast(e instanceof Error ? e.message : 'Could not remove session');
      }
    });
  }

  function toggleComplete(trainingDayId: string | null, session: SessionItem) {
    if (!trainingDayId || session.id.startsWith('temp-')) return;
    const next: SessionItem['status'] = session.status === 'completed' ? 'planned' : 'completed';
    startTransition(async () => {
      applyOptimistic({ type: 'updateStatus', sessionId: session.id, status: next });
      try {
        await updateSessionStatus(session.id, next, trainingDayId);
      } catch (e) {
        setToast(e instanceof Error ? e.message : 'Could not update session');
      }
    });
  }

  // ── modal lists ─────────────────────────────────────────────
  const qLower = query.trim().toLowerCase();
  const matches = (text: string) => qLower === '' || text.toLowerCase().includes(qLower);

  const gymItems  = catalog.filter(c => c.sessionType === 'gym'  && !scheduledTemplateIds.has(c.templateId) && matches(c.sessionName));
  const gymRecommended = gymItems.filter(c => c.recommended);
  const gymOther       = gymItems.filter(c => !c.recommended);
  const swimItems = catalog.filter(c => c.sessionType === 'swim' && !scheduledTemplateIds.has(c.templateId) && matches(c.sessionName));
  const otherItems = recurringActivities.filter(a => matches(a.label));
  const testItems  = testSessions.filter(t => !scheduledTemplateIds.has(t.templateId) && matches(t.sessionName));
  const hasTests   = testSessions.length > 0;

  const activeConditioningType = conditioningTypeForPhase(phaseType);
  const weekHasConditioning    = weekSessions.some(w => w.session.session_type === 'conditioning');
  const conditioningItems      = conditioningSessions.filter(
    s => s.type === activeConditioningType && matches(s.name),
  );

  return (
    <>
      {/* ── Week Calendar ────────────────────────────────── */}
      <div className="space-y-2">
        {days.map(day => (
          <div
            key={day.dateStr}
            className={`rounded-xl border bg-card px-5 py-4 ${day.isToday ? 'ring-1 ring-primary/20 border-border' : 'border-border'}`}
          >
            <p className="text-sm font-semibold mb-2">
              <span style={day.isToday ? { color: 'var(--current-primary)' } : {}}>{day.label}</span>
              <span className="text-muted-foreground/35 font-normal"> · {day.sublabel}</span>
            </p>

            {day.sessions.length > 0 && (
              <div className="flex flex-col mb-1.5">
                {day.sessions.map(session => {
                  const isTemp = session.id.startsWith('temp-');
                  const isDone = session.status === 'completed';
                  const isSkipped = session.status === 'skipped';
                  const rowInner = (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <SessionIcon sessionType={session.session_type} sessionName={session.session_name} />
                      <span className={`text-sm truncate ${isSkipped ? 'line-through text-muted-foreground/50' : isDone ? 'text-muted-foreground/60' : 'text-foreground/90'}`}>
                        {session.session_name}
                      </span>
                    </div>
                  );
                  return (
                    <div
                      key={session.id}
                      className="group flex items-center gap-2 py-1"
                    >
                      <button
                        type="button"
                        onClick={() => toggleComplete(day.trainingDayId, session)}
                        disabled={isPending || isTemp}
                        aria-label={isDone ? `Reopen ${session.session_name}` : `Complete ${session.session_name}`}
                        className="shrink-0 p-0.5 disabled:opacity-30 transition-colors"
                      >
                        {isDone
                          ? <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--current-primary)' }} />
                          : isSkipped
                          ? <Minus className="h-4 w-4 text-muted-foreground/35" />
                          : <Circle className="h-4 w-4 text-muted-foreground/25 hover:text-muted-foreground/60" />
                        }
                      </button>
                      {day.trainingDayId && !isTemp ? (
                        <Link href={`/planner/${day.trainingDayId}`} className="min-w-0 flex-1 hover:opacity-60 transition-opacity">
                          {rowInner}
                        </Link>
                      ) : (
                        <div className="min-w-0 flex-1">{rowInner}</div>
                      )}
                      <button
                        type="button"
                        onClick={() => unschedule(day.trainingDayId, session)}
                        disabled={isPending || isTemp}
                        aria-label={`Remove ${session.session_name}`}
                        className="shrink-0 p-0.5 text-muted-foreground/25 hover:text-foreground disabled:opacity-30 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={() => openAdd(day.dateStr)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Session
            </button>
          </div>
        ))}
      </div>

      {/* ── Add Session modal ────────────────────────────── */}
      {activeDay && (
        <div
          key={activeDay.dateStr}
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/30 p-0 sm:p-4"
          onClick={closeAdd}
          role="dialog"
          aria-modal="true"
          aria-label={`Add session to ${activeDay.label}`}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-xl flex flex-col max-h-[90dvh] sm:max-h-[85vh]"
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/40">
                  Add Session
                </p>
                <p className="text-sm font-medium mt-0.5">{activeDay.label} · {activeDay.sublabel}</p>
              </div>
              <button
                type="button"
                onClick={closeAdd}
                aria-label="Close"
                className="rounded-full p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* on this day */}
            <div className="px-5 pb-3 border-b border-border">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/40 mb-2">
                On {activeDay.label}
              </p>

              {activeDaySessions.length === 0 ? (
                <p className="text-xs text-muted-foreground/40">Nothing on this day yet.</p>
              ) : (
                <div className="space-y-1">
                  {activeDaySessions.map(({ session, trainingDayId }) => (
                    <DaySessionRow
                      key={session.id}
                      session={session}
                      trainingDayId={trainingDayId}
                      onRemove={unschedule}
                      isPending={isPending}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* tabs */}
            <div className="flex gap-1 px-5 pt-3">
              {(['gym', 'swim', 'other', 'conditioning', ...(hasTests ? ['test' as Tab] : [])] as Tab[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-lg px-1 py-1.5 text-xs font-medium capitalize transition-colors ${
                    tab === t
                      ? 'bg-primary/[0.08] text-foreground'
                      : 'text-muted-foreground/55 hover:text-foreground'
                  }`}
                >
                  {t === 'test' ? 'Tests' : t}
                </button>
              ))}
            </div>

            {/* search */}
            <div className="px-5 pt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search sessions…"
                  className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-ring/40"
                />
              </div>
            </div>

            {/* list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 pb-5 space-y-1">
              {tab === 'gym' && (
                dayHasGym ? (
                  <DayLimitHint message={`${activeDay.label} already has a gym session.`} />
                ) : (
                  <>
                    {gymRecommended.length > 0 && (
                      <>
                        <p className="flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase text-muted-foreground/40 mb-1">
                          <Star className="h-3 w-3" /> Recommended this phase
                        </p>
                        {gymRecommended.map(item => (
                          <CatalogRow
                            key={item.templateId}
                            icon={<SessionIcon sessionType="gym" />}
                            label={item.sessionName}
                            onAdd={() => assign(activeDay.dateStr, item)}
                          />
                        ))}
                        {gymOther.length > 0 && (
                          <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground/40 mt-3 mb-1">
                            All gym sessions
                          </p>
                        )}
                      </>
                    )}
                    {gymOther.map(item => (
                      <CatalogRow
                        key={item.templateId}
                        icon={<SessionIcon sessionType="gym" />}
                        label={item.sessionName}
                        onAdd={() => assign(activeDay.dateStr, item)}
                      />
                    ))}
                    {gymItems.length === 0 && <EmptyHint />}
                  </>
                )
              )}

              {tab === 'swim' && (
                dayHasSwim ? (
                  <DayLimitHint message={`${activeDay.label} already has a swim session.`} />
                ) : (
                  <>
                    {swimItems.map(item => (
                      <CatalogRow
                        key={item.templateId}
                        icon={<SessionIcon sessionType="swim" />}
                        label={item.sessionName}
                        onAdd={() => assign(activeDay.dateStr, item)}
                      />
                    ))}
                    {swimItems.length === 0 && <EmptyHint />}
                  </>
                )
              )}

              {tab === 'other' && (
                <>
                  {otherItems.map(act => (
                    <CatalogRow
                      key={act.key}
                      icon={<SessionIcon sessionType={act.sessionType} />}
                      label={act.label}
                      onAdd={() =>
                        assign(activeDay.dateStr, {
                          sessionName: act.sessionName,
                          sessionType: act.sessionType,
                          templateId:  null,
                        })
                      }
                    />
                  ))}
                  {otherItems.length === 0 && <EmptyHint />}
                </>
              )}

              {tab === 'conditioning' && (
                weekHasConditioning ? (
                  <DayLimitHint message="A conditioning session is already scheduled this week." />
                ) : (
                  <>
                    <p className="flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase text-muted-foreground/40 mb-1">
                      <Star className="h-3 w-3" /> {conditioningLabel(activeConditioningType)} — {phaseType ?? 'current phase'}
                    </p>
                    {conditioningItems.map(item => (
                      <CatalogRow
                        key={item.name}
                        icon={<SessionIcon sessionType="conditioning" />}
                        label={item.name}
                        sublabel={item.description}
                        onAdd={() =>
                          assign(activeDay.dateStr, {
                            sessionName: item.name,
                            sessionType: 'conditioning',
                            templateId:  null,
                          })
                        }
                      />
                    ))}
                    {conditioningItems.length === 0 && <EmptyHint />}
                  </>
                )
              )}

              {tab === 'test' && (
                <>
                  {testItems.map(item => (
                    <CatalogRow
                      key={item.templateId}
                      icon={<SessionIcon sessionType="test" />}
                      label={`${item.sessionName} · ${item.dateLabel}`}
                      onAdd={() =>
                        assign(activeDay.dateStr, {
                          sessionName: item.sessionName,
                          sessionType: 'test',
                          templateId:  item.templateId,
                        })
                      }
                    />
                  ))}
                  {testItems.length === 0 && (
                    testSessions.length > 0
                      ? <DayLimitHint message="All tests for this week are already scheduled." />
                      : <EmptyHint />
                  )}
                </>
              )}
            </div>

            <div
              className="px-5 py-3 border-t border-border"
              style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
            >
              <button
                type="button"
                onClick={closeAdd}
                className="w-full rounded-lg py-2 text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--current-primary)' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── toast ─────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-border bg-card px-4 py-2 text-sm shadow-lg flex items-center gap-2">
          <Check className="h-3.5 w-3.5 text-teal-600" />
          {toast}
        </div>
      )}
    </>
  );
}

function DaySessionRow({
  session,
  trainingDayId,
  onRemove,
  isPending,
}: {
  session:       SessionItem;
  trainingDayId: string | null;
  onRemove:      (trainingDayId: string | null, session: SessionItem) => void;
  isPending:     boolean;
}) {
  const isTemp = session.id.startsWith('temp-');
  return (
    <div className="group flex items-center gap-2.5 py-1 text-sm">
      <SessionIcon sessionType={session.session_type} sessionName={session.session_name} />
      <span className="truncate flex-1 text-foreground/90">{session.session_name}</span>
      <button
        type="button"
        onClick={() => onRemove(trainingDayId, session)}
        disabled={isPending || isTemp}
        aria-label={`Remove ${session.session_name}`}
        className="shrink-0 p-0.5 text-muted-foreground/25 hover:text-foreground disabled:opacity-30 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function CatalogRow({
  icon,
  label,
  sublabel,
  onAdd,
}: {
  icon:      React.ReactNode;
  label:     string;
  sublabel?: string;
  onAdd:     () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex w-full items-start gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left hover:border-primary/40 hover:bg-primary/[0.03] transition-colors"
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm truncate">{label}</span>
        {sublabel && (
          <span className="block text-[11px] text-muted-foreground/50 leading-relaxed mt-0.5 line-clamp-2">
            {sublabel}
          </span>
        )}
      </span>
      <Plus className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
    </button>
  );
}

function DayLimitHint({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 px-1 py-4 text-sm text-muted-foreground/60">
      <Check className="h-4 w-4 shrink-0 text-teal-600/70" />
      {message}
    </div>
  );
}

function EmptyHint() {
  return <p className="py-6 text-center text-xs text-muted-foreground/40">No sessions available.</p>;
}
