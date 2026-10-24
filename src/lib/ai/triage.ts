import { db } from "@/lib/db";
import { callModel } from "./client";
import { buildPrompt } from "./buildPrompt";
import { decisionSchema, type Decision } from "./schema";

type Row = {
  request_id: string;
  message: string;
  order_id: string;
  merchant_type: string;
  item_name: string;
  amount_cents: number;
  details: string;
  customer_email: string;
  order_created_at: string;
};

function parseModelJson(text: string): unknown {
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

export async function triageRequest(requestId: string): Promise<Decision> {
  const row = db
    .prepare(
      `SELECT r.id AS request_id, r.message, o.id AS order_id, o.merchant_type, o.item_name,
              o.amount_cents, o.details, o.customer_email, o.created_at AS order_created_at
       FROM requests r JOIN orders o ON o.id = r.order_id
       WHERE r.id = ?`
    )
    .get(requestId) as Row | undefined;
  if (!row) throw new Error("Request not found");

  const recent = db
    .prepare(
      `SELECT COUNT(*) AS n FROM requests r JOIN orders o ON o.id = r.order_id
       WHERE o.customer_email = ? AND r.id != ? AND r.created_at >= datetime('now', '-30 days')`
    )
    .get(row.customer_email, requestId) as { n: number };

  const sub = db
    .prepare(
      `SELECT plan_name, status FROM subscriptions
       WHERE customer_email = ? ORDER BY created_at DESC LIMIT 1`
    )
    .get(row.customer_email) as { plan_name: string; status: string } | undefined;

  const purchased = Date.parse(row.order_created_at.replace(" ", "T") + "Z");
  const days = Math.max(0, Math.floor((Date.now() - purchased) / 86_400_000));

  const prompt = buildPrompt({
    merchantType: row.merchant_type,
    itemName: row.item_name,
    amountCents: row.amount_cents,
    daysSincePurchase: days,
    orderDetails: row.details,
    recentRequestCount: recent.n,
    customerMessage: row.message,
    subscriptionStatus: sub ? `${sub.plan_name} (${sub.status})` : "none",
  });

  let decision: Decision | null = null;
  let lastError: unknown;
  for (let attempt = 0; attempt < 2 && !decision; attempt++) {
    try {
      const parsed = decisionSchema.parse(parseModelJson(await callModel(prompt)));
      decision = parsed;
    } catch (e) {
      lastError = e;
    }
  }
  if (!decision) {
    db.prepare("UPDATE requests SET status = 'triage_failed' WHERE id = ?").run(requestId);
    throw new Error("Triage failed: " + (lastError instanceof Error ? lastError.message : String(lastError)));
  }

  // Safety clamp: code, not the AI, has the final say on amounts.
  let amount = decision.amount_cents;
  if (decision.action === "refund") amount = row.amount_cents;
  if (decision.action === "partial_refund" || decision.action === "refund") {
    amount = Math.min(amount ?? 0, row.amount_cents);
  } else {
    amount = null;
  }

  db.prepare(
    `INSERT INTO decisions (id, request_id, action, amount_cents, confidence, reasoning, policy_clauses, draft_reply)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    crypto.randomUUID(),
    requestId,
    decision.action,
    amount,
    decision.confidence,
    decision.reasoning,
    JSON.stringify(decision.policy_clauses),
    decision.draft_reply
  );
  db.prepare("UPDATE requests SET status = 'triaged' WHERE id = ?").run(requestId);

  return { ...decision, amount_cents: amount };
}