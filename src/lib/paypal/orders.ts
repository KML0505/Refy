import { paypalFetch } from "./client";

export function centsToValue(cents: number) {
  return (cents / 100).toFixed(2);
}

export async function createPayPalOrder(amountCents: number) {
  return paypalFetch("/v2/checkout/orders", {
    intent: "CAPTURE",
    purchase_units: [
      { amount: { currency_code: "USD", value: centsToValue(amountCents) } },
    ],
  });
}

export async function capturePayPalOrder(orderId: string) {
  return paypalFetch(`/v2/checkout/orders/${orderId}/capture`);
}