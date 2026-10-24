import { db } from "../src/lib/db";
import { activateSubscription, getSubscription } from "../src/lib/paypal/subscriptions";

const subId = process.argv[2];
if (!subId) {
  console.error("Usage: npx tsx --env-file=.env.local scripts/link-subscription.ts SUBSCRIPTION_ID");
  process.exit(1);
}

async function main() {
  let sub = await getSubscription(subId);
  console.log("PayPal status:", sub.status);

  if (sub.status === "SUSPENDED") {
    await activateSubscription(subId, "Reactivating for demo");
    sub = await getSubscription(subId);
    console.log("After reactivate:", sub.status);
  }

  const order = db
    .prepare(
      `SELECT customer_email FROM orders
       WHERE status = 'paid' AND id NOT LIKE 'seed-%'
       ORDER BY created_at DESC LIMIT 1`
    )
    .get() as { customer_email: string } | undefined;
  if (!order) throw new Error("No real paid order found to take the buyer email from.");

  db.prepare("DELETE FROM subscriptions WHERE paypal_subscription_id = ?").run(subId);
  db.prepare(
    `INSERT INTO subscriptions (id, paypal_subscription_id, customer_email, plan_name, status)
     VALUES (?, ?, ?, 'Monthly snack box', ?)`
  ).run(crypto.randomUUID(), subId, order.customer_email, sub.status);

  console.log("Linked to", order.customer_email, "with status", sub.status);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});