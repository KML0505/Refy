import { db } from "@/lib/db";
import { refundCapture } from "@/lib/paypal/refunds";
import { alreadyRefundedCents, checkRefundAllowed } from "./guards";
import { suspendSubscription } from "@/lib/paypal/subscriptions";

type DecisionRow = {
  id: string;
  request_id: string;
  action: string;
  amount_cents: number | null;
  status: string;
  order_id: string;
  paid_cents: number;
  capture_id: string | null;
};

export async function approveDecision(
  decisionId: string,
  approvedBy: string,
  overrideAmountCents?: number
) {
  const d = db
    .prepare(
      `SELECT d.id, d.request_id, d.action, d.amount_cents, d.status,
              o.id AS order_id, o.amount_cents AS paid_cents, o.paypal_capture_id AS capture_id
       FROM decisions d
       JOIN requests r ON r.id = d.request_id
       JOIN orders o ON o.id = r.order_id
       WHERE d.id = ?`
    )
    .get(decisionId) as DecisionRow | undefined;
  if (!d) throw new Error("Decision not found");

  // Claim the decision atomically so a double click can't refund twice.
  const claimed = db
    .prepare("UPDATE decisions SET status = 'executing' WHERE id = ? AND status = 'pending'")
    .run(decisionId);
  if (claimed.changes === 0) throw new Error(`Decision is already ${d.status}`);

  try {
    if (d.action === "refund" || d.action === "partial_refund") {
      if (!d.capture_id) throw new Error("This order has no PayPal capture ID.");
      const amount = overrideAmountCents ?? d.amount_cents ?? 0;
      const check = checkRefundAllowed(d.paid_cents, amount, alreadyRefundedCents(d.order_id));
      if (!check.ok) throw new Error(check.reason);

      const refund = await refundCapture(d.capture_id, amount);
      db.prepare(
        `UPDATE decisions SET status = 'executed', approved_by = ?, amount_cents = ?, paypal_refund_id = ? WHERE id = ?`
      ).run(approvedBy, amount, refund.id ?? null, decisionId);
    } else if (d.action === "pause_subscription") {
      const email = (
        db
          .prepare("SELECT customer_email FROM orders WHERE id = ?")
          .get(d.order_id) as { customer_email: string }
      ).customer_email;

      const sub = db
        .prepare(
          `SELECT id, paypal_subscription_id FROM subscriptions
           WHERE customer_email = ? AND status = 'ACTIVE'
           ORDER BY created_at DESC LIMIT 1`
        )
        .get(email) as { id: string; paypal_subscription_id: string } | undefined;
      if (!sub) throw new Error("No active subscription found for this customer.");

      await suspendSubscription(sub.paypal_subscription_id, "Paused at the customer's request");
      db.prepare("UPDATE subscriptions SET status = 'SUSPENDED' WHERE id = ?").run(sub.id);
      db.prepare("UPDATE decisions SET status = 'executed', approved_by = ? WHERE id = ?").run(
        approvedBy,
        decisionId
      );
    } else {
      // status_reply, hold, deny: no PayPal call.
      db.prepare("UPDATE decisions SET status = 'executed', approved_by = ? WHERE id = ?").run(
        approvedBy,
        decisionId
      );
    }
  } catch (err) {
    // Put it back so the merchant can retry or override.
    db.prepare("UPDATE decisions SET status = 'pending' WHERE id = ?").run(decisionId);
    throw err;
  }
}