const BASE = "https://api-m.sandbox.paypal.com";
const clientId = process.env.PAYPAL_CLIENT_ID;
const secret = process.env.PAYPAL_CLIENT_SECRET;
if (!clientId || !secret) throw new Error("Missing PayPal env vars");

async function token(): Promise<string> {
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

async function call(t: string, method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text(); // suspend/activate may return an empty 204 body
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(`${method} ${path} failed (${res.status}): ${text.slice(0, 600)}`);
  return data;
}

async function main() {
  const t = await token();
  const subId = process.argv[2];

  if (!subId) {
    const product = await call(t, "POST", "/v1/catalogs/products", {
      name: "Monthly snack box",
      type: "PHYSICAL",
    });
    console.log("Product:", product.id);

    const plan = await call(t, "POST", "/v1/billing/plans", {
      product_id: product.id,
      name: "Monthly snack box plan",
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: { fixed_price: { value: "19.00", currency_code: "USD" } },
        },
      ],
      payment_preferences: { auto_bill_outstanding: true, payment_failure_threshold: 3 },
    });
    console.log("Plan:", plan.id);

    const sub = await call(t, "POST", "/v1/billing/subscriptions", {
      plan_id: plan.id,
      application_context: {
        brand_name: "ResolutionDesk demo",
        user_action: "SUBSCRIBE_NOW",
        return_url: "https://example.com/return",
        cancel_url: "https://example.com/cancel",
      },
    });
    const approve = sub.links?.find((l: { rel: string }) => l.rel === "approve");
    console.log("Subscription:", sub.id, "status:", sub.status);
    console.log("Approve as your SANDBOX PERSONAL buyer (private window):");
    console.log(approve?.href);
    console.log(`Then run: npx tsx --env-file=.env.local scripts/subscription-test.ts ${sub.id}`);
    return;
  }

  const before = await call(t, "GET", `/v1/billing/subscriptions/${subId}`);
  console.log("Status before:", before.status);

  await call(t, "POST", `/v1/billing/subscriptions/${subId}/suspend`, { reason: "Customer asked to pause" });
  const after = await call(t, "GET", `/v1/billing/subscriptions/${subId}`);
  console.log("Status after suspend:", after.status);

  if (process.argv[3] === "reactivate") {
    await call(t, "POST", `/v1/billing/subscriptions/${subId}/activate`, { reason: "Resuming" });
    const again = await call(t, "GET", `/v1/billing/subscriptions/${subId}`);
    console.log("Status after reactivate:", again.status);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});