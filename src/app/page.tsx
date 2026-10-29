import { BRAND } from "@/lib/brand";
import Hero from "@/components/landing/Hero";
import DecisionDemo from "@/components/landing/DecisionDemo";
import Reveal from "@/components/landing/Reveal";

const steps = [
  { n: "1", title: "A customer reports a problem", body: "They pay through PayPal, then describe what went wrong in plain language." },
  { n: "2", title: "AI reads it and recommends", body: "It checks the shop's policy, the order, and the customer's history, then proposes an outcome with clear reasoning and a draft reply." },
  { n: "3", title: "You approve, PayPal acts", body: "One click sends the refund or pauses the subscription. Your code enforces the limits, so the AI can never refund more than was paid." },
];

const outcomes: { label: string; cls: string }[] = [
  { label: "Full refund", cls: "badge-success" },
  { label: "Partial refund", cls: "badge-success" },
  { label: "Status reply", cls: "badge-info" },
  { label: "Pause subscription", cls: "badge-neutral" },
  { label: "Hold for review", cls: "badge-warning" },
  { label: "Deny", cls: "badge-danger" },
];

export default function Home() {
  return (
    <>
      <Hero />

      <div className="container">
        <section id="demo" style={{ scrollMarginTop: 90 }}>
          <div style={{ display: "grid", gap: 40, alignItems: "center", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
            <Reveal>
              <div className="eyebrow">See it work</div>
              <h2 style={{ fontSize: "1.5rem" }}>Watch one complaint become a refund</h2>
              <p>
                A customer complains. {BRAND} reads it, checks the policy, and recommends an action with its reasoning. You
                approve, and PayPal pays out. Every action needs a person, and the code caps every refund.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <DecisionDemo />
            </Reveal>
          </div>
        </section>

        <section style={{ marginTop: 72 }}>
          <Reveal>
            <h2>How it works</h2>
          </Reveal>
          <div style={{ display: "grid", gap: 16, marginTop: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="card card-hover" style={{ height: "100%" }}>
                  <div style={{ color: "var(--accent-hover)", fontWeight: 600, marginBottom: 8 }}>Step {s.n}</div>
                  <h3>{s.title}</h3>
                  <p style={{ marginBottom: 0 }}>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 56 }}>
          <Reveal>
            <h2>What {BRAND} can decide</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {outcomes.map((o) => (
                <span key={o.label} className={`badge ${o.cls}`}>{o.label}</span>
              ))}
            </div>
          </Reveal>
        </section>

        <section style={{ marginTop: 56 }}>
          <Reveal>
            <div className="card">
              <h3>About this demo</h3>
              <p style={{ marginBottom: 0 }}>
                Everything runs on the PayPal sandbox with test money. Past cases on the dashboard are sample data, and
                shipment tracking is simulated. A person approves every action.
              </p>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}