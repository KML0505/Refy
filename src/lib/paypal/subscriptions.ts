import { paypalFetch } from "./client";

export async function getSubscription(id: string) {
  return paypalFetch(`/v1/billing/subscriptions/${id}`, undefined, "GET");
}

export async function suspendSubscription(id: string, reason: string) {
  await paypalFetch(`/v1/billing/subscriptions/${id}/suspend`, { reason });
}

export async function activateSubscription(id: string, reason: string) {
  await paypalFetch(`/v1/billing/subscriptions/${id}/activate`, { reason });
}