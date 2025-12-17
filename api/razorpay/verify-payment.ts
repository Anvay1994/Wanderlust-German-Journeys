import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
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

const verifySignature = (orderId: string, paymentId: string, signature: string, secret: string) => {
  const payload = `${orderId}|${paymentId}`;
  const digest = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return digest === signature;
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

    if (!PRICE_BY_LEVEL[level]) {
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

    const authHeader = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
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
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}
