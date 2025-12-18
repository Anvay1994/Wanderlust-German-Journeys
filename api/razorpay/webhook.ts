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
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
};

const getHeader = (req: any, name: string) => {
  const key = Object.keys(req.headers || {}).find((k) => k.toLowerCase() === name.toLowerCase());
  const value = key ? req.headers[key] : undefined;
  if (Array.isArray(value)) return value[0];
  return value;
};

const readRawBody = async (req: any): Promise<Buffer> => {
  if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
  if (Buffer.isBuffer(req.body)) return req.body;

  const alreadyEnded = Boolean((req as any).readableEnded || (req as any).complete);
  if (alreadyEnded) {
    if (req.body && typeof req.body === 'object') {
      return Buffer.from(JSON.stringify(req.body), 'utf8');
    }
    return Buffer.from('', 'utf8');
  }

  return await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: any) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
};

const verifyWebhookSignature = (rawBody: Buffer, signature: string, secret: string) => {
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const webhookSecret = getRequiredEnv('RAZORPAY_WEBHOOK_SECRET');
    const signature = getHeader(req, 'x-razorpay-signature');
    if (!signature) {
      res.status(400).json({ error: 'Missing webhook signature' });
      return;
    }

    const rawBody = await readRawBody(req);
    if (!verifyWebhookSignature(rawBody, String(signature), webhookSecret)) {
      res.status(400).json({ error: 'Invalid webhook signature' });
      return;
    }

    const payload = JSON.parse(rawBody.toString('utf8') || '{}');
    const event = payload?.event;
    const payment = payload?.payload?.payment?.entity;
    const order = payload?.payload?.order?.entity;

    const paymentId: string | undefined = payment?.id;
    const orderId: string | undefined = payment?.order_id || order?.id;
    const paymentStatus: string | undefined = payment?.status;

    const isCaptureEvent = event === 'payment.captured' || event === 'order.paid';
    if (!isCaptureEvent) {
      res.status(200).json({ received: true, ignored: true });
      return;
    }

    if (!paymentId || !orderId) {
      res.status(200).json({ received: true, ignored: true });
      return;
    }

    if (paymentStatus && paymentStatus !== 'captured') {
      res.status(200).json({ received: true, ignored: true, status: paymentStatus });
      return;
    }

    const razorpayKeyId = getRequiredEnv('RAZORPAY_KEY_ID');
    const razorpayKeySecret = getRequiredEnv('RAZORPAY_KEY_SECRET');
    const authHeader = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');

    const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json'
      }
    });
    const orderData = await orderResponse.json().catch(() => ({}));
    if (!orderResponse.ok) {
      res.status(200).json({ received: true, ignored: true, reason: 'order_fetch_failed' });
      return;
    }

    const userId = typeof orderData?.notes?.user_id === 'string' ? orderData.notes.user_id : null;
    const level = typeof orderData?.notes?.level === 'string' ? orderData.notes.level : null;
    if (!userId || !level || !PRICE_BY_LEVEL[level]) {
      res.status(200).json({ received: true, ignored: true, reason: 'missing_notes' });
      return;
    }

    const basePrice = PRICE_BY_LEVEL[level];
    const amountInr = Number(orderData.amount) / 100;
    const tokensFromOrder = Math.max(0, Math.round(basePrice - amountInr));

    const supabaseUrl = getRequiredEnv('VITE_SUPABASE_URL');
    const supabaseServiceKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const description = `LEVEL_${level} | Razorpay ${paymentId}`;
    const { data: existingTxn } = await supabaseAdmin
      .from('transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('description', description)
      .maybeSingle();

    if (existingTxn) {
      res.status(200).json({ received: true, duplicate: true });
      return;
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits, streak_count, owned_levels')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      res.status(200).json({ received: true, ignored: true, reason: 'profile_missing' });
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
      res.status(200).json({ received: true, ignored: true, reason: 'profile_update_failed' });
      return;
    }

    const { error: insertError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: userId,
        description,
        amount_inr: amountInr,
        amount_credits: safeTokens
      });

    if (insertError) {
      res.status(200).json({ received: true, ignored: true, reason: 'txn_insert_failed' });
      return;
    }

    res.status(200).json({ received: true, ok: true });
  } catch (error: any) {
    res.status(200).json({ received: true, ok: false, error: error?.message || 'Server error' });
  }
}

