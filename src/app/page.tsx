import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "60px auto", padding: 16 }}>
      <h1>ResolutionDesk</h1>
      <p>
        An AI agent for small online shops. It reads customer complaints, checks them against the
        shop&apos;s refund policy, and recommends what to do. The merchant approves, and PayPal
        sends the refund.
      </p>

      <div style={{ display: "grid", gap: 16, marginTop: 32 }}>
        <section style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16 }}>
          <h2>For the merchant</h2>
          <p>Review AI recommendations and approve refunds.</p>
          <Link href="/dashboard">Open the dashboard</Link>
        </section>

        <section style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16 }}>
          <h2>For the customer</h2>
          <p>Buy something in the demo shop, then report a problem with your order.</p>
          <Link href="/store">Open the demo store</Link>
          {" | "}
          <Link href="/store/help">Report a problem</Link>
        </section>
      </div>

      <p style={{ marginTop: 32, fontSize: 14, color: "#666" }}>
        Demo only: this app uses the PayPal sandbox with test money.
      </p>
    </main>
  );
}