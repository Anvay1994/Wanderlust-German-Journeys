export default async function handler(_req: any, res: any) {
  try {
    const hasFetch = typeof (globalThis as any).fetch === 'function';
    const hasBuffer = typeof (globalThis as any).Buffer !== 'undefined';
    const nodeVersion = (process as any)?.version;

    const env = (name: string) => (process as any)?.env?.[name];
    const keyId = env('RAZORPAY_KEY_ID');
    const keySecret = env('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      res.status(500).json({ ok: false, error: 'Missing Razorpay env vars' });
      return;
    }

    const authHeader =
      typeof Buffer !== 'undefined'
        ? Buffer.from(`${keyId}:${keySecret}`).toString('base64')
        : (globalThis as any).btoa?.(`${keyId}:${keySecret}`);

    if (!authHeader) {
      res.status(500).json({ ok: false, error: 'Auth encoding failed' });
      return;
    }

    let razorpayStatus: number | null = null;
    let razorpayBody: any = null;
    let razorpayOk: boolean | null = null;

    if (hasFetch) {
      const r = await fetch('https://api.razorpay.com/v1/orders?count=1', {
        method: 'GET',
        headers: { Authorization: `Basic ${authHeader}` }
      });
      razorpayStatus = r.status;
      razorpayOk = r.ok;
      const ct = r.headers.get('content-type') || '';
      razorpayBody = ct.includes('application/json') ? await r.json().catch(() => null) : await r.text().catch(() => null);
    }

    res.status(200).json({
      ok: true,
      runtime: { nodeVersion, hasFetch, hasBuffer },
      razorpay: { ok: razorpayOk, status: razorpayStatus, body: razorpayBody }
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message || 'Server error' });
  }
}

