import { PRICE_BY_LEVEL, sanitizeTokens } from './pricing';

const getRequiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

const getAuthToken = (req: any) => {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (!header || typeof header !== 'string') return null;
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');

    const token = getAuthToken(req);
    if (!token) {
      res.status(401).json({ error: 'Missing auth token' });
      return;
    }

    const { level, tokensRedeemed } = parseBody(req);
    if (!level || !PRICE_BY_LEVEL[level]) {
      res.status(400).json({ error: 'Invalid level' });
      return;
    }

    const supabaseUrl = getRequiredEnv('VITE_SUPABASE_URL');
    const supabaseAnonKey = getRequiredEnv('VITE_SUPABASE_ANON_KEY');
    const supabaseServiceKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      res.status(401).json({ error: 'Invalid auth token' });
      return;
    }

    const userId = authData.user.id;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits, streak_count, owned_levels')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const ownedLevels = Array.isArray(profile.owned_levels) ? profile.owned_levels : [];
    if (ownedLevels.includes(level)) {
      res.status(400).json({ error: 'Level already owned' });
      return;
    }

    const basePrice = PRICE_BY_LEVEL[level];
    const safeTokens = sanitizeTokens(
      Number(tokensRedeemed) || 0,
      Number(profile.credits) || 0,
      basePrice,
      Number(profile.streak_count) || 0
    );

    const amountInr = Math.max(0, Math.round((basePrice - safeTokens) * 100)) / 100;
    if (amountInr <= 0) {
      res.status(400).json({ error: 'Amount must be greater than zero' });
      return;
    }

    const razorpayKeyId = getRequiredEnv('RAZORPAY_KEY_ID');
    const razorpayKeySecret = getRequiredEnv('RAZORPAY_KEY_SECRET');
    const authHeader =
      typeof Buffer !== 'undefined'
        ? Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64')
        : (globalThis as any).btoa?.(`${razorpayKeyId}:${razorpayKeySecret}`);

    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(amountInr * 100),
        currency: 'INR',
        receipt: `level_${level}_${Date.now()}`,
        notes: {
          user_id: userId,
          level,
          tokens_redeemed: String(safeTokens)
        }
      })
    });

    const orderData = await orderResponse.json();
    if (!orderResponse.ok) {
      res.status(502).json({ error: orderData?.error?.description || 'Failed to create order' });
      return;
    }

    res.status(200).json({
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId: razorpayKeyId,
      name: 'Wanderlust German Journeys',
      description: `Level ${level} access`
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}
