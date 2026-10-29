import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import PayPalButton from "@/components/store/PayPalButton";
import ProductArt from "@/components/store/ProductArt";

const META: Record<string, { blurb: string; from: string; to: string }> = {
  mug: { blurb: "Hand-glazed ceramic mug, 350 ml.", from: "#5b7cf0", to: "#b45cff" },
  print: { blurb: "A3 art print on matte paper.", from: "#4aa3ff", to: "#3ecf8e" },
  box: { blurb: "A box of small-batch snacks.", from: "#f5a524", to: "#f4525c" },
};

export default function StorePage() {
  return (
    <div className="container">
      <div className="eyebrow">Demo store</div>
      <h1>Buy something, then break it</h1>
      <p style={{ maxWidth: 620 }}>
        Pay with the PayPal sandbox buyer account (test money only). Afterwards, report a problem with your order and
        watch the AI work through it on the dashboard.
      </p>
      <p className="muted" style={{ fontSize: "0.82rem" }}>Sandbox demo: test money only, no real payments.</p>

      <div style={{ display: "grid", gap: 20, marginTop: 24, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {PRODUCTS.map((p) => {
          const m = META[p.id] ?? META.mug;
          return (
            <section key={p.id} className="card card-hover">
              <ProductArt id={p.id} />
              <h2 style={{ textTransform: "none", letterSpacing: "-0.01em", fontSize: "1.1rem" }}>{p.name}</h2>
              <p style={{ marginBottom: 0 }}>{m.blurb}</p>
              <div className="price">${(p.amountCents / 100).toFixed(2)}</div>
              <PayPalButton productId={p.id} />
            </section>
          );
        })}
      </div>

      <p style={{ marginTop: 28 }}>
        Already bought something? <Link href="/store/help">Report a problem with your order</Link>.
      </p>
    </div>
  );
}