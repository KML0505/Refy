import { NextResponse } from "next/server";
import { approveDecision } from "@/lib/actions/executor";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const override = typeof body.amountCents === "number" ? body.amountCents : undefined;
    await approveDecision(id, "merchant", override);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("approve failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 400 }
    );
  }
}