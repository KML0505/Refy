import { db } from "@/lib/db";

export function alreadyRefundedCents(orderId: string): number {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(d.amount_cents), 0) AS total
       FROM decisions d JOIN requests r ON r.id = d.request_id
       WHERE r.order_id = ? AND d.status = 'executed'
         AND d.action IN ('refund', 'partial_refund')`
    )
    .get(orderId) as { total: number };
  return row.total;
}

export function checkRefundAllowed(
  paidCents: number,
  requestedCents: number,
  refundedCents: number
): { ok: true } | { ok: false; reason: string } {
  if (!Number.isInteger(requestedCents) || requestedCents <= 0) {
    return { ok: false, reason: "Refund amount must be a positive whole number of cents." };
  }
  if (requestedCents > paidCents - refundedCents) {
    return {
      ok: false,
      reason: `Refund of ${requestedCents} exceeds the remaining refundable amount (${paidCents - refundedCents}).`,
    };
  }
  return { ok: true };
}