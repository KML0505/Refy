import { paypalFetch } from "./client";
import { centsToValue } from "./orders";

export async function refundCapture(captureId: string, amountCents: number) {
  return paypalFetch(`/v2/payments/captures/${captureId}/refund`, {
    amount: { currency_code: "USD", value: centsToValue(amountCents) },
  });
}