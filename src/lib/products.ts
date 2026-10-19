export const PRODUCTS = [
  { id: "mug", name: "Ceramic mug", amountCents: 2400 },
  { id: "print", name: "Art print", amountCents: 3500 },
  { id: "box", name: "Monthly snack box", amountCents: 1900 },
];

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}