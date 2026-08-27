import type { createClient } from '@/lib/supabase/server';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// The athlete's current macrocycle.
//
// Read paths used to stand in for this with `order by start_date desc
// limit 1`, duplicated in every page. That guess breaks as soon as an
// athlete has more than one cycle: creating a new one would silently
// shadow the old one everywhere, with no way to keep the old cycle as
// history. Exactly one row per athlete now carries `is_active`, enforced
// by a partial unique index, so `maybeSingle()` is safe here.
//
// `columns` is deliberately a plain `string` rather than a generic literal:
// supabase-js parses select strings at the type level, and feeding that
// parser an unresolved type parameter blows up the TypeScript compiler.
// Callers name the row shape instead — `activeMacrocycle<Macrocycle>(...)`.
export async function activeMacrocycle<T>(
  supabase: SupabaseServerClient,
  columns: string,
): Promise<T | null> {
  const { data } = await supabase
    .from('macrocycles')
    .select(columns)
    .eq('is_active', true)
    .maybeSingle();

  return (data as T | null) ?? null;
}
