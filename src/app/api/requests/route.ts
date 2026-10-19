import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { triageRequest } from "@/lib/ai/triage";

const bodySchema = z.object({
  orderId: z.string().min(1),
  message: z.string().min(5).max(2000),
});

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter an order number and a message (at least 5 characters)." },
        { status: 400 }
      );
    }
    const { orderId, message } = parsed.data;

    const order = db
      .prepare("SELECT id, status FROM orders WHERE id = ?")
      .get(orderId) as { id: string; status: string } | undefined;

    if (!order || order.status !== "paid") {
      return NextResponse.json(
        { error: "We couldn't find a paid order with that number." },
        { status: 404 }
      );
    }

    const id = crypto.randomUUID();
    db.prepare("INSERT INTO requests (id, order_id, message) VALUES (?, ?, ?)").run(id, orderId, message);

    try {
      await triageRequest(id);
    } catch (e) {
      console.error("Triage error (request still saved):", e);
    }

    return NextResponse.json({ id });
  } catch (err) {
    console.error("requests POST failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const rows = db
      .prepare(
        `SELECT r.id, r.message, r.status, r.created_at,
                o.customer_name, o.item_name, o.amount_cents
         FROM requests r
         JOIN orders o ON o.id = r.order_id
         ORDER BY r.created_at DESC`
      )
      .all();
    return NextResponse.json(rows);
  } catch (err) {
    console.error("requests GET failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}