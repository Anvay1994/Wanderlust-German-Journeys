<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Wanderlust: German Journeys
An AI-powered German learning adventure: onboard, pick a mission, practice with a guided roleplay, earn XP/credits, and unlock harder routes. Supabase persists profiles, progress, and purchases; Gemini powers mission briefings and dialog.

View in AI Studio: https://ai.studio/apps/drive/1_xhTNuGy_JDH2pMi4SV6fkPS_jGdR6Gb

## Stack
- React + Vite + TypeScript
- Supabase (auth, profiles, transactions, curriculum)
- Google Gemini (`@google/genai`) for missions, feedback, drills
- Tailwind CDN + custom styles for the UI

## Quickstart
Prerequisites: Node.js 18+ and npm.

1) Install deps  
`npm install`

2) Configure environment variables (create `.env` in the project root):
```
VITE_GEMINI_API_KEY=your_gemini_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
Note: The code includes fallback demo keys for convenience—replace with your own before real use.

3) Run the app  
`npm run dev`

4) Build / preview  
`npm run build`  
`npm run preview`

## Supabase setup
The full schema (tables, RLS policies, triggers, seed curriculum) lives inside `database.tsx` as `SUPABASE_SCHEMA_SQL`. To apply it:
- Open the Supabase SQL editor, paste the contents of `SUPABASE_SCHEMA_SQL`, and run.
- This creates:
  - `profiles`: user profile + progress
  - `transactions`: purchase history
  - `curriculum_modules`: catalog of missions
  - `user_module_progress`: per-module status
- RLS policies are included; auth users can only read/write their own rows. A trigger creates a profile row when a new auth user registers.

## App guide
- Onboarding: capture name, level, interests; create Supabase profile. Guest mode available (no DB sync).
- Dashboard: pick modules, track XP/credits/streak, open store, jump to Guidebook, or run dev actions (add credits, unlock all, reset).
- Mission: Gemini generates briefings, objectives, dialog, feedback, and XP updates. Exit returns you to Dashboard and persists progress.
- Store: purchase higher CEFR levels with credits/tokens; purchases are logged to Supabase.
- Guidebook: level-specific reference content.
- Admin Console: developer utilities and data views.

## Troubleshooting
- If GitHub shows “Permission denied (publickey)”, ensure your SSH key is added to the agent and to GitHub, or switch remote to HTTPS.
- Supabase calls will silently no-op if env vars are missing; verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set.
- Gemini calls need `VITE_GEMINI_API_KEY`; rate limits or invalid keys will surface in the browser console.
