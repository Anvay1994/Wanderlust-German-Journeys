<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1_xhTNuGy_JDH2pMi4SV6fkPS_jGdR6Gb

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Private Testing (Access Code Gate)

To make the app “private” for beta testers (especially on the Vercel free plan), the UI is protected by an access-code screen.

### Configure on Vercel

1. Vercel Dashboard → your project → **Settings** → **Environment Variables**
2. Add:
   - `APP_ACCESS_CODE` = `KOLHATKAR2025`
3. Add it for **Production** (and **Preview** if you share preview links).
4. Trigger a new deployment (or wait for the next git push).

### Share with testers

- Share your Vercel URL + the access code.
- Testers enter the code once per browser/device (it is remembered locally).

## Payments (Razorpay) + Webhook (Recommended)

This app uses Vercel Serverless Functions under `api/razorpay/*` to create orders, verify payments, and receive Razorpay webhooks.

### Prevent duplicate transactions in Supabase (IMPORTANT)

Razorpay may deliver webhooks more than once. To ensure your database never stores duplicate purchase rows (and to avoid accidental double credit deductions in edge cases), add a unique index in Supabase.

1. Supabase Dashboard → SQL Editor → New query
2. Run this (safe, copy/paste):

```sql
-- 1) Remove existing duplicates (keeps the earliest by created_at)
delete from public.transactions t
using (
  select id,
         row_number() over (partition by user_id, description order by created_at asc, id asc) as rn
  from public.transactions
) d
where t.id = d.id and d.rn > 1;

-- 2) Prevent duplicates going forward (same user + same payment description)
create unique index if not exists transactions_user_description_unique
on public.transactions (user_id, description);
```
