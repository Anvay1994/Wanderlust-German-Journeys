import crypto from 'node:crypto';
const PRICE_BY_LEVEL: Record<string, number> = {
  A1: 1499,
  A2: 2999,
  B1: 2999,
  B2: 2999,
  C1: 2999,
  C2: 2999
};

const getDiscountLimit = (streak: number) => {
  if (streak >= 30) return 0.3;
  if (streak >= 7) return 0.25;
  return 0.2;
};

const getMaxUsableTokens = (credits: number, basePrice: number, streak: number) => {
  const maxDiscountAmount = basePrice * getDiscountLimit(streak);
  const maxTokensForDiscount = Math.floor(maxDiscountAmount);
  return Math.min(credits, maxTokensForDiscount);
};

const sanitizeTokens = (requestedTokens: number, credits: number, basePrice: number, streak: number) => {
  if (!Number.isFinite(requestedTokens) || requestedTokens < 0) return 0;
  const maxTokens = getMaxUsableTokens(credits, basePrice, streak);
  return Math.min(Math.floor(requestedTokens), maxTokens);
};

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

const verifySignature = (orderId: string, paymentId: string, signature: string, secret: string) => {
  const payload = `${orderId}|${paymentId}`;
  const digest = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return digest === signature;
};

export default async function handler(req: any, res: any) {
  try {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    } catch {
      // ignore
    }

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { createClient } = await import('@supabase/supabase-js');

    const token = getAuthToken(req);
    if (!token) {
      res.status(401).json({ error: 'Missing auth token' });
      return;
    }

    const { orderId, paymentId, signature, level } = parseBody(req);
    if (!orderId || !paymentId || !signature || !level) {
      res.status(400).json({ error: 'Missing payment verification fields' });
      return;
    }

    if (typeof level !== 'string' || !PRICE_BY_LEVEL[level]) {
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

    const razorpayKeyId = getRequiredEnv('RAZORPAY_KEY_ID');
    const razorpayKeySecret = getRequiredEnv('RAZORPAY_KEY_SECRET');
    if (!verifySignature(orderId, paymentId, signature, razorpayKeySecret)) {
      res.status(400).json({ error: 'Invalid payment signature' });
      return;
    }

    const authHeader =
      typeof Buffer !== 'undefined'
        ? Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64')
        : (globalThis as any).btoa?.(`${razorpayKeyId}:${razorpayKeySecret}`);
    if (!authHeader) {
      res.status(500).json({ error: 'Server auth encoding failed' });
      return;
    }
    const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json'
      }
    });

    const orderData = await orderResponse.json();
    if (!orderResponse.ok) {
      res.status(502).json({ error: orderData?.error?.description || 'Failed to fetch order' });
      return;
    }

    if (orderData?.notes?.user_id && orderData.notes.user_id !== userId) {
      res.status(403).json({ error: 'Order does not belong to this user' });
      return;
    }

    const basePrice = PRICE_BY_LEVEL[level];
    const amountInr = Number(orderData.amount) / 100;
    const tokensFromOrder = Math.max(0, Math.round(basePrice - amountInr));

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
    const safeTokens = sanitizeTokens(
      tokensFromOrder,
      Number(profile.credits) || 0,
      basePrice,
      Number(profile.streak_count) || 0
    );

    const updatedOwned = ownedLevels.includes(level) ? ownedLevels : [...ownedLevels, level];
    const updatedCredits = Math.max(0, (Number(profile.credits) || 0) - safeTokens);

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        credits: updatedCredits,
        owned_levels: updatedOwned,
        last_active: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      res.status(500).json({ error: 'Failed to update profile' });
      return;
    }

    const { error: insertError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: userId,
        description: `LEVEL_${level} | Razorpay ${paymentId}`,
        amount_inr: amountInr,
        amount_credits: safeTokens
      });

    if (insertError) {
      res.status(500).json({ error: 'Failed to record transaction' });
      return;
    }

    res.status(200).json({
      success: true,
      credits: updatedCredits,
      ownedLevels: updatedOwned,
      transactionId: paymentId
    });
  } catch (error: any) {
    try {
      res.status(500).json({
        error: error?.message || 'Server error',
        details: {
          name: error?.name,
          cause: error?.cause ? String(error.cause) : undefined
        }
      });
    } catch {
      throw error;
    }
  }
}
