import { connection, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  await connection(); // run on every request, never at build time
  try {
    const rows = db
      .prepare(
        `SELECT COALESCE(d.id, 'untriaged:' || r.id) AS id,
                COALESCE(d.action, 'manual_review') AS action,
                d.amount_cents,
                COALESCE(d.confidence, 'low') AS confidence,
                COALESCE(d.reasoning, 'No decision is linked to this request. Review it manually.') AS reasoning,
                COALESCE(d.policy_clauses, '[]') AS policy_clauses,
                COALESCE(d.draft_reply, 'Manual review is required. No refund has been issued.') AS draft_reply,
                CASE
                  WHEN d.id IS NOT NULL THEN d.status
                  WHEN r.status IN ('triage_failed', 'triaged') THEN 'triage_failed'
                  ELSE 'triaging'
                END AS status,
                COALESCE(d.created_at, r.created_at) AS created_at,
                r.message,
                o.customer_name,
                o.item_name,
                o.amount_cents AS paid_cents,
                (
                  SELECT s.status
                  FROM subscriptions s
                  WHERE s.customer_email = o.customer_email
                  ORDER BY s.created_at DESC
                  LIMIT 1
                ) AS sub_status
         FROM requests r
         JOIN orders o ON o.id = r.order_id
         LEFT JOIN decisions d ON d.request_id = r.id
         ORDER BY COALESCE(d.created_at, r.created_at) DESC`
      )
      .all();

    return NextResponse.json(rows, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (err) {
    console.error("decisions GET failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Having a second method keeps this route from being prerendered, like /api/requests.
export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}