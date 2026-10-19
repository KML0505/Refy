import { PRODUCTS } from "@/lib/products";
import PayPalButton from "@/components/store/PayPalButton";

export default function StorePage() {
  return (
    <main style={{ maxWidth: 480, margin: "40px auto", padding: 16 }}>
      <h1>Mock Store</h1>
      {PRODUCTS.map((p) => (
        <section key={p.id} style={{ margin: "24px 0" }}>
          <h2>{p.name}</h2>
          <p>${(p.amountCents / 100).toFixed(2)}</p>
          <PayPalButton productId={p.id} />
        </section>
      ))}
    </main>
  );
}