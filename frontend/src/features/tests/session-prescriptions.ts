import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * What a testing session prescribes, read from the database.
 *
 * This replaces features/tests/sessions-config.ts, which held one
 * athlete's week 2 as a TypeScript literal and resolved its entries by
 * matching template NAMES. That is how the pull up went missing: the
 * config said 'Pull Up 1RM', the template was called 'Supinated Pull Up
 * 1RM', and a name that matches nothing produces no row and no error.
 * These are foreign keys, so they cannot miss quietly.
 */
export type PrescribedTest = {
  id:          string;
  name:        string;
  metric_type: string;
  unit:        string | null;
};

type ItemRow = {
  testing_session_id: string;
  order_index:        number;
  test_templates: {
    id: string; name: string; metric_type: string; unit: string | null;
  } | null;
};

/**
 * The tests each of these sessions prescribes, keyed by session id.
 *
 * A session with no items comes back absent rather than empty-handed by
 * accident: nine of this athlete's testing sessions were never described
 * anywhere, and showing nothing for them is the honest result.
 */
export async function prescriptionsForSessions(
  supabase:   SupabaseClient,
  sessionIds: string[],
): Promise<Map<string, PrescribedTest[]>> {
  const bySession = new Map<string, PrescribedTest[]>();
  if (sessionIds.length === 0) return bySession;

  const { data } = await supabase
    .from('testing_session_items')
    .select('testing_session_id, order_index, test_templates(id, name, metric_type, unit)')
    .in('testing_session_id', sessionIds)
    .order('order_index', { ascending: true });

  for (const row of (data ?? []) as unknown as ItemRow[]) {
    // The join is one-to-one, but supabase-js types it as possibly an
    // array depending on how it infers the relationship.
    const raw = row.test_templates;
    const template = Array.isArray(raw) ? raw[0] : raw;
    if (!template) continue;

    const list = bySession.get(row.testing_session_id) ?? [];
    list.push({
      id:          template.id,
      name:        template.name,
      metric_type: template.metric_type,
      unit:        template.unit,
    });
    bySession.set(row.testing_session_id, list);
  }

  return bySession;
}

/** Just the names, for the surfaces that only list them. */
export function testNames(tests: PrescribedTest[] | undefined): string[] {
  return (tests ?? []).map(t => t.name);
}
