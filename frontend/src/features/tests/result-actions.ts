'use server';

import { createClient } from '@/lib/supabase/server';

// ── types ─────────────────────────────────────────────────────

export type SaveState = {
  success: boolean;
  error:   string | null;
};

// ── helpers ───────────────────────────────────────────────────

// Parses "Back Squat 3RM" → 3, "Supinated Pull Up 1RM" → 1, otherwise null.
function parseRepMax(templateName: string): number | null {
  const m = templateName.match(/(\d+)RM$/i);
  return m ? parseInt(m[1], 10) : null;
}

// Epley: weight × (1 + reps/30). For 1RM tests, result_value is the 1RM directly.
function epley1RM(resultValue: number, repMax: number): number {
  if (repMax <= 1) return resultValue;
  return resultValue * (1 + repMax / 30);
}

function parseResultValue(raw: string, metricType: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (metricType === 'time') {
    if (trimmed.includes(':')) {
      const [minPart, secPart] = trimmed.split(':');
      const mins = parseFloat(minPart);
      const secs = parseFloat(secPart);
      if (!isNaN(mins) && !isNaN(secs)) return mins * 60 + secs;
    }
    const secs = parseFloat(trimmed);
    return isNaN(secs) ? null : secs;
  }

  const val = parseFloat(trimmed);
  return isNaN(val) ? null : val;
}

// ── action ────────────────────────────────────────────────────

export async function saveTestingResults(
  _prevState: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const testingBlockId   = formData.get('testing_block_id')      as string;
  const testingSessionId = formData.get('testing_session_id')    as string;
  const macrocycleId     = formData.get('macrocycle_id')         as string;
  const phaseId          = formData.get('phase_id')              as string | null;
  const totalBlockTemplates = parseInt(
    (formData.get('total_block_templates') as string) || '0', 10
  );
  const templateIds = formData.getAll('template_id') as string[];

  if (!testingBlockId || !testingSessionId || !macrocycleId || templateIds.length === 0) {
    return { success: false, error: 'Missing required context.' };
  }

  // ── fetch template metadata for 1RM calculation ──────────

  const { data: templates } = await supabase
    .from('test_templates')
    .select('id, name, calculates_estimated_1rm')
    .in('id', templateIds)
    .eq('user_id', user.id);

  const templateMap = new Map(
    (templates ?? []).map(t => [t.id, t])
  );

  // ── build insert rows ─────────────────────────────────────

  const inserts: {
    user_id:              string;
    test_template_id:     string;
    testing_block_id:     string;
    testing_session_id:   string;
    macrocycle_id:        string;
    phase_id:             string | null;
    result_value:         number;
    estimated_1rm_kg:     number | null;
    notes:                string | null;
  }[] = [];

  for (const templateId of templateIds) {
    const raw        = (formData.get(`result_${templateId}`)      as string) ?? '';
    const metricType = (formData.get(`metric_type_${templateId}`) as string) ?? 'numeric';
    const notes      = (formData.get(`notes_${templateId}`)       as string) ?? '';

    const resultValue = parseResultValue(raw, metricType);
    if (resultValue === null) continue;

    const tmpl   = templateMap.get(templateId);
    const repMax = tmpl ? parseRepMax(tmpl.name) : null;
    let estimated1RM: number | null = null;

    if (repMax === 1) {
      // 1RM test: result_value is the 1RM directly
      estimated1RM = resultValue;
    } else if (tmpl?.calculates_estimated_1rm && repMax !== null) {
      estimated1RM = Math.round(epley1RM(resultValue, repMax) * 10) / 10;
    }

    inserts.push({
      user_id:            user.id,
      test_template_id:   templateId,
      testing_block_id:   testingBlockId,
      testing_session_id: testingSessionId,
      macrocycle_id:      macrocycleId,
      phase_id:           phaseId || null,
      result_value:       resultValue,
      estimated_1rm_kg:   estimated1RM,
      notes:              notes.trim() || null,
    });
  }

  if (inserts.length === 0) {
    return { success: false, error: 'No results entered.' };
  }

  const { error: insertError } = await supabase.from('test_results').insert(inserts);
  if (insertError) return { success: false, error: insertError.message };

  // ── session completion ────────────────────────────────────
  // Session is complete when all its templates have a result.

  const { data: sessionResults } = await supabase
    .from('test_results')
    .select('test_template_id')
    .eq('testing_session_id', testingSessionId)
    .eq('user_id', user.id);

  const distinctSessionTemplates = new Set(
    (sessionResults ?? []).map(r => r.test_template_id)
  );

  if (distinctSessionTemplates.size >= templateIds.length) {
    await supabase
      .from('testing_sessions')
      .update({ status: 'completed' })
      .eq('id', testingSessionId);
  }

  // ── block status progression ──────────────────────────────
  // pending → in_progress on first result
  // in_progress → completed when all block templates are done

  const { data: blockRow } = await supabase
    .from('testing_blocks')
    .select('status')
    .eq('id', testingBlockId)
    .single();

  if (blockRow?.status === 'pending') {
    await supabase
      .from('testing_blocks')
      .update({ status: 'in_progress' })
      .eq('id', testingBlockId);
  }

  if (totalBlockTemplates > 0) {
    const { data: blockResults } = await supabase
      .from('test_results')
      .select('test_template_id')
      .eq('testing_block_id', testingBlockId)
      .eq('user_id', user.id);

    const distinctBlockTemplates = new Set(
      (blockResults ?? []).map(r => r.test_template_id)
    );

    if (distinctBlockTemplates.size >= totalBlockTemplates) {
      await supabase
        .from('testing_blocks')
        .update({ status: 'completed' })
        .eq('id', testingBlockId);
    }
  }

  return { success: true, error: null };
}
