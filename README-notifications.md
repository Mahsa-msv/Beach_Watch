# Beach Watch notifications (SMS + Email)

SMS uses **Twilio**; email uses **SendGrid** (Twilio's email platform). Both run
server-side only; secrets are never exposed to the browser.

## 1. Credentials you need

| Variable | Where to get it |
| --- | --- |
| `TWILIO_ACCOUNT_SID` | Twilio Console, Account Info |
| `TWILIO_AUTH_TOKEN` | Twilio Console, Account Info |
| `TWILIO_PHONE_NUMBER` | Your Twilio number in E.164, e.g. `+19025550123` |
| `SENDGRID_API_KEY` | SendGrid, Settings, API Keys |
| `SENDGRID_FROM_EMAIL` | A sender verified in SendGrid (Single Sender Verification) |
| `DEMO_PHONE` (optional) | Default recipient for the demo button, E.164 |
| `DEMO_EMAIL` (optional) | Default email recipient for the demo button |

Trial-account notes:
- A Twilio **trial** account can only text **verified** numbers. Verify your phone
  in the Twilio Console, and put it in `DEMO_PHONE` in E.164 format.
- SendGrid will not send until you complete **Single Sender Verification** (or domain
  auth) for `SENDGRID_FROM_EMAIL`.

## 2. Local development

Fill the values in `.env.local` (already git-ignored), then restart `npm run dev`.
Open the bell in the top right and use **Send test alert (demo)**. Errors (bad
credentials, unverified number) show as a message under the button rather than failing
silently.

## 3. Deployed demo (Vercel)

Add the same variables to the Vercel project, then redeploy. Either use the dashboard
(Project, Settings, Environment Variables) or the CLI, once per variable:

```bash
npx vercel env add TWILIO_ACCOUNT_SID production
npx vercel env add TWILIO_AUTH_TOKEN production
npx vercel env add TWILIO_PHONE_NUMBER production
npx vercel env add SENDGRID_API_KEY production
npx vercel env add SENDGRID_FROM_EMAIL production
npx vercel env add DEMO_PHONE production
npx vercel env add DEMO_EMAIL production
```

Each command prompts for the value (you type it; it is stored as a secret). Then
redeploy so the new env is used:

```bash
npx vercel --prod
```

## How it works

- `lib/sms.ts` -> `sendSmsAlert(to, message)` via Twilio.
- `lib/email.ts` -> `sendEmailAlert(to, subject, message)` via SendGrid.
- `POST /api/notify` picks a beach, builds `Beach Watch alert: {name} - {status}`, and
  sends. `mode: "test"` (the demo button) always sends, simulating an advisory when a
  beach is off-season; `mode: "auto"` only sends on a real closure/advisory.
- `/api/cron/refresh` also diffs the new data against the last check and auto-alerts the
  `DEMO_` recipient for any beach that newly became a closure/advisory (best-effort; a
  production version would store subscribers and last state in a database).
