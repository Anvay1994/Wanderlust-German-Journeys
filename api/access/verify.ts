const getRequiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

const parseBody = (req: any) => {
  if (req.body && typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body ?? {};
};

export default async function handler(req: any, res: any) {
  try {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    } catch {
      // ignore
    }

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'Method not allowed' });
      return;
    }

    const { code } = parseBody(req);
    const expected = getRequiredEnv('APP_ACCESS_CODE');

    if (!code || typeof code !== 'string') {
      res.status(400).json({ ok: false, error: 'Missing code' });
      return;
    }

    const normalized = code.trim();
    if (!normalized) {
      res.status(400).json({ ok: false, error: 'Missing code' });
      return;
    }

    if (normalized !== expected) {
      res.status(401).json({ ok: false, error: 'Invalid code' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'Server error' });
  }
}

