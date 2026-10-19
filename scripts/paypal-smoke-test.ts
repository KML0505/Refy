const BASE = "https://api-m.sandbox.paypal.com";
const clientId = process.env.PAYPAL_CLIENT_ID;
const secret = process.env.PAYPAL_CLIENT_SECRET;

if (!clientId || !secret) {
  throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in .env.local");
}

async function getToken(): Promise<string> {
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${clientId}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Token failed: " + JSON.stringify(data));
  return data.access_token;
}

async function createOrder(token: string) {
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value: "24.00" } }],
      payment_source: {
        paypal: {
          experience_context: {
            return_url: "https://example.com/return",
            cancel_url: "https://example.com/cancel",
            user_action: "PAY_NOW",
          },
        },
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Create order failed: " + JSON.stringify(data));
  return data;
}

async function captureOrder(token: string, orderId: string) {
  const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Capture failed: " + JSON.stringify(data));
  return data;
}

async function refundCapture(token: string, captureId: string, value: string) {
  const res = await fetch(`${BASE}/v2/payments/captures/${captureId}/refund`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: { currency_code: "USD", value } }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Refund failed: " + JSON.stringify(data));
  return data;
}

async function main() {
  const orderId = process.argv[2];
  const token = await getToken();
  console.log("Got access token.");

  if (!orderId) {
    const order = await createOrder(token);
    const link = order.links.find(
      (l: { rel: string }) => l.rel === "payer-action" || l.rel === "approve"
    );
    console.log("Order created:", order.id);
    console.log("Open this link and approve as your SANDBOX BUYER:");
    console.log(link?.href);
    console.log(`Then run: npx tsx --env-file=.env.local scripts/paypal-smoke-test.ts ${order.id}`);
    return;
  }

  const captured = await captureOrder(token, orderId);
  const captureId = captured.purchase_units[0].payments.captures[0].id;
  console.log("Captured. Capture ID:", captureId);

  const refund = await refundCapture(token, captureId, "24.00");
  console.log("Refund result:", refund.id, refund.status);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});