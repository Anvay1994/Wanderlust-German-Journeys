import { createClient } from '@supabase/supabase-js';
import { CURRICULUM } from '../../constants.js';

const getEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'Method not allowed' });
      return;
    }

    const headerToken =
      req.headers['x-sync-token'] ||
      req.headers['x-sync_token'] ||
      req.headers['sync-token'] ||
      req.headers['sync_token'];
    const expected = process.env.SYNC_TOKEN || process.env.ADMIN_SYNC_TOKEN;
    if (!expected) {
      res.status(500).json({ ok: false, error: 'Missing SYNC_TOKEN/ADMIN_SYNC_TOKEN' });
      return;
    }
    if (headerToken !== expected) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }

    const supabaseUrl = getEnv('VITE_SUPABASE_URL');
    const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const payload = CURRICULUM.map((mod) => ({
      id: mod.id,
      level: mod.level,
      title: mod.title,
      description: mod.description,
      grammar_focus: mod.grammarFocus,
      vocabulary_theme: mod.vocabularyTheme,
      mission_type: mod.missionType
    }));

    const { error } = await supabase
      .from('curriculum_modules')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('[sync-curriculum] upsert error', error);
      res.status(500).json({ ok: false, error: error.message });
      return;
    }

    res.status(200).json({ ok: true, count: payload.length });
  } catch (e: any) {
    console.error('[sync-curriculum] unexpected error', e);
    res.status(500).json({ ok: false, error: e?.message || 'Unexpected error', stack: e?.stack });
  }
}
