import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProduct } from "@/lib/products";
import { createPayPalOrder } from "@/lib/paypal/orders";

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();
    const product = getProduct(productId);
    if (!product) {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }

    const order = await createPayPalOrder(product.amountCents);
    const id = crypto.randomUUID();

    db.prepare(
      `INSERT INTO orders (id, customer_name, customer_email, item_name, amount_cents, status, paypal_order_id)
       VALUES (?, ?, ?, ?, ?, 'created', ?)`
    ).run(id, "Pending", "pending@example.com", product.name, product.amountCents, order.id);

    return NextResponse.json({ id: order.id });
  } catch (err) {
    console.error("create-order failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}