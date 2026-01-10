import { createClient } from '@supabase/supabase-js';

const getEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
};

const parseLevelFromDescription = (description: string | null) => {
  if (!description) return 'Unknown';
  const match = description.match(/LEVEL[_ ]?([A-C][12]?)/i);
  return match ? match[1].toUpperCase() : 'Unknown';
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ ok: false, error: 'Method not allowed' });
      return;
    }

    const headerToken =
      req.headers['x-admin-token'] ||
      req.headers['x-sync-token'] ||
      req.headers['sync-token'];
    const expected = process.env.ADMIN_DASH_TOKEN || process.env.SYNC_TOKEN;
    if (!expected) {
      res.status(500).json({ ok: false, error: 'Missing ADMIN_DASH_TOKEN or SYNC_TOKEN' });
      return;
    }
    if (headerToken !== expected) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }

    const supabaseUrl = getEnv('VITE_SUPABASE_URL');
    const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [txnResult, signupResult, activeResult] = await Promise.all([
      supabase.from('transactions').select('amount_inr, description, user_id'),
      supabase.from('profiles').select('id').gte('created_at', sevenDaysAgo),
      supabase.from('profiles').select('id').gte('last_active', sevenDaysAgo)
    ]);

    if (txnResult.error) throw txnResult.error;
    if (signupResult.error) throw signupResult.error;
    if (activeResult.error) throw activeResult.error;

    const totalRevenue = (txnResult.data || []).reduce((sum, row: any) => sum + (Number(row.amount_inr) || 0), 0);
    const newSignups = (signupResult.data || []).length;
    const activeStudents = (activeResult.data || []).length;

    const revenueByLevel: Record<string, number> = {};
    (txnResult.data || []).forEach((row: any) => {
      const level = parseLevelFromDescription(row.description);
      revenueByLevel[level] = (revenueByLevel[level] || 0) + (Number(row.amount_inr) || 0);
    });

    res.status(200).json({
      ok: true,
      totalRevenue,
      activeStudents,
      newSignups,
      revenueByLevel
    });
  } catch (e: any) {
    console.error('[admin-metrics] error', e);
    res.status(500).json({ ok: false, error: e?.message || 'Unexpected error' });
  }
}

