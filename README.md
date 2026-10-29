## Refy : AI Customer Resolution Desk

## Run it locally

**Requirements:** Node.js 20 or newer, a free [PayPal developer](https://developer.paypal.com) account with a sandbox app, and an AI API key.

```bash
git clone [repo URL]
cd [repo folder]
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Name | Purpose |
|---|---|
| `PAYPAL_CLIENT_ID` | Sandbox app client ID (server) |
| `PAYPAL_CLIENT_SECRET` | Sandbox app secret (server only, never expose) |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Same client ID, for the checkout button |
| `AI_API_KEY` | Gemini API key |
| `AI_MODEL` | Gemini model name |
| `NEXT_PUBLIC_AG_STUDIO_LICENSE` | Optional AG Studio licence key |

### PayPal sandbox setup

1. In the developer dashboard, create a sandbox app and copy its client ID and secret.
2. Use the **Business** sandbox account as the merchant, and a **Personal** account as the buyer. A merchant can't pay itself, so always check out as the Personal account.

### Seed the sample data

```bash
npx tsx scripts/seed-demo.ts
```

This fills the dashboard with sample cases. It's safe to rerun, and it only replaces rows with IDs starting `seed-`. Seeded orders have no PayPal capture, so only orders you buy through the store can be refunded for real.
