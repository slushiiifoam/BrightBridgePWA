# BrightBridgePWA
- https://bright-bridge-pwa.netlify.app/ 

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# BrightBridge PWA

BrightBridge is a React + Vite single-page app deployed on Netlify. The original static site remains under `legacy-static/` as migration reference only; Vite does not publish it.

Production site: https://bright-bridge-pwa.netlify.app/

## Run the app

```sh
npm ci
npm run dev
```

The regular Vite server is useful for visual work. On localhost, the Identity widget asks once for the production Netlify site URL so it can reach that site's Identity service. Netlify Functions still require the local proxy:

```sh
netlify dev
```

Use a real HTTPS Netlify Deploy Preview to verify Google login, callback handling, logout, session restoration, and cross-tab behavior in both Safari and Chrome.

## Required Netlify setup

The checked-in `netlify.toml` sets:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- SPA fallback: unknown app routes return `index.html`

Enable Netlify Identity, email/password registration, and its Google provider for the same site. Keep testing on one hostname during an auth flow; production and branch-deploy hostnames have separate browser cookies. If email confirmation is enabled, new email/password users must follow the confirmation link before their first login.

Add these environment variables in Netlify:

- `SUPABASE_URL` — the existing BrightBridge Supabase project URL.
- `SUPABASE_PUBLISHABLE_KEY` — the modern public `sb_publishable_...` key used during the prototype.

The publishable key runs as Supabase's low-privilege anonymous role. The current Netlify Function still verifies the Netlify Identity user before handling journal requests, but the key itself is public and cannot prevent direct Supabase API calls. Keep Row Level Security enabled with appropriate policies, and migrate the policies to authenticated Supabase users when the app moves to Supabase Auth.

Copy `.env.example` to `.env` for local Netlify testing and replace both placeholder values. The journal endpoint returns `503` until the URL and publishable key are configured.

The existing database schema is preserved:

- `users(uuid, email)`
- `journal_entry(uuid, created_date, entry, overall_emotion)`
- A unique constraint on `journal_entry(uuid, created_date)` is required by the daily upsert.

## App routes

- `/` — welcome screen
- `/login` — opens the Netlify Identity widget for email/password login, signup, recovery, invites, and Google
- `/home` — protected dashboard
- `/journal/today` — protected onboarding/today editor
- `/daily-checkin` — protected recent journal history
- `/help` — public support hub
- `/help/relationships/:type` — public shared relationship-help page

Legacy `/assets/*.html` URLs redirect to the matching React route. The old project linked to grounding, resources, conflict, microskills, quiz, and video files that never existed; these show explicit Coming Soon screens instead of silently returning the app shell.

## Authentication and journal design

`AuthProvider` is the only React owner of session state. The browser uses `netlify-identity-widget` for the complete login UI and client session. The protected Netlify Function uses `@netlify/identity` to verify requests server-side. Before journal requests, the client asks the widget for a fresh JWT and sends it as a bearer token; BrightBridge does not maintain another user or token store.

The browser never chooses or sends a user ID to the journal API. `netlify/functions/journal.mjs` derives the UUID from the verified Identity user and performs Supabase access on the server. Journal notes and moods share one record per user per local calendar day.

## Checks before a deploy

```sh
npm run lint
npm run build
node --check netlify/functions/journal.mjs
```

Then verify `/`, `/login`, `/help`, and one protected route on the Deploy Preview. Also confirm an unauthenticated request to `/.netlify/functions/journal` returns JSON with `401`, not the React HTML page.
