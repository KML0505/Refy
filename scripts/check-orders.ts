import { db } from "../src/lib/db";

console.log(
  db
    .prepare(
      "SELECT id, item_name, amount_cents, status, paypal_capture_id, customer_name FROM orders ORDER BY created_at DESC"
    )
    .all()
);