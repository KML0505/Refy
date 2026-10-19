import { db } from "../src/lib/db";

console.log(
  db
    .prepare(
      `SELECT r.id, r.status, r.message, o.item_name, o.amount_cents
       FROM requests r JOIN orders o ON o.id = r.order_id
       ORDER BY r.created_at DESC`
    )
    .all()
);