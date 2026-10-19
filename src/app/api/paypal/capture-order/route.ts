import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { capturePayPalOrder } from "@/lib/paypal/orders";

export async function POST(req: Request) {
  const { orderID } = await req.json();

  const row = db
    .prepare("SELECT id FROM orders WHERE paypal_order_id = ?")
    .get(orderID) as { id: string } | undefined;
  if (!row) return NextResponse.json({ error: "Unknown order" }, { status: 404 });

  const captured = await capturePayPalOrder(orderID);
  const captureId = captured.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  if (!captureId) {
    return NextResponse.json({ error: "No capture ID returned" }, { status: 502 });
  }

  const payer = captured.payer;
  const name = [payer?.name?.given_name, payer?.name?.surname].filter(Boolean).join(" ") || "Customer";

  db.prepare(
    `UPDATE orders SET status = 'paid', paypal_capture_id = ?, customer_name = ?, customer_email = ?, details = ?
     WHERE id = ?`
  ).run(
    captureId,
    name,
    payer?.email_address ?? "unknown@example.com",
    JSON.stringify({ tracking: { carrier: "PostalCo", number: "PC-DEMO-" + row.id.slice(0, 6), status: "In transit", eta: "2 days" } }),
    row.id
  );
  
  return NextResponse.json({ ok: true, orderId: row.id });
}