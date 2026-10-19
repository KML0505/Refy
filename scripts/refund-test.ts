import { db } from "../src/lib/db";
import { refundCapture } from "../src/lib/paypal/refunds";

const orderId = process.argv[2];
const cents = Number(process.argv[3] ?? 100);

if (!orderId) {
  console.error("Usage: npx tsx --env-file=.env.local scripts/refund-test.ts ORDER_ID [AMOUNT_CENTS]");
  process.exit(1);
}

const order = db
  .prepare("SELECT id, item_name, amount_cents, paypal_capture_id FROM orders WHERE id = ?")
  .get(orderId) as
  | { id: string; item_name: string; amount_cents: number; paypal_capture_id: string | null }
  | undefined;

if (!order || !order.paypal_capture_id) {
  console.error("No paid order with a capture ID found for that ID.");
  process.exit(1);
}

console.log(`Refunding ${cents} cents of ${order.item_name} (paid ${order.amount_cents})...`);

refundCapture(order.paypal_capture_id, cents)
  .then((r) => console.log("Refund result:", r.id, r.status))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });