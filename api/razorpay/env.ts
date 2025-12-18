export default function handler(_req: any, res: any) {
  const env = (name: string) => Boolean((process as any)?.env?.[name]);

  res.status(200).json({
    ok: true,
    env: {
      VITE_SUPABASE_URL: env('VITE_SUPABASE_URL'),
      VITE_SUPABASE_ANON_KEY: env('VITE_SUPABASE_ANON_KEY'),
      SUPABASE_SERVICE_ROLE_KEY: env('SUPABASE_SERVICE_ROLE_KEY'),
      RAZORPAY_KEY_ID: env('RAZORPAY_KEY_ID'),
      RAZORPAY_KEY_SECRET: env('RAZORPAY_KEY_SECRET'),
      RAZORPAY_WEBHOOK_SECRET: env('RAZORPAY_WEBHOOK_SECRET')
    },
    ts: new Date().toISOString()
  });
}
