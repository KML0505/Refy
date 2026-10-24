import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const rows = db
      .prepare(
        `SELECT d.id, d.action, d.amount_cents, d.confidence, d.reasoning,
                d.policy_clauses, d.draft_reply, d.status, d.created_at,
                r.message, o.customer_name, o.item_name, o.amount_cents AS paid_cents,
                (SELECT s.status FROM subscriptions s
                  WHERE s.customer_email = o.customer_email
                  ORDER BY s.created_at DESC LIMIT 1) AS sub_status
         FROM decisions d
         JOIN requests r ON r.id = d.request_id
         JOIN orders o ON o.id = r.order_id
         ORDER BY d.created_at DESC`
      )
      .all();
    return NextResponse.json(rows);
  } catch (err) {
    console.error("decisions GET failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}