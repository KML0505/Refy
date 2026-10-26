"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const rowAnim = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.35 },
};

export default function DecisionDemo() {
  const reduce = useReducedMotion();
  const [t, setT] = useState(0);

  useEffect(() => {
    if (reduce) {
      setT(4);
      return;
    }
    const id = setInterval(() => setT((x) => (x + 1) % 7), 1700);
    return () => clearInterval(id);
  }, [reduce]);

  const statusLabel = t >= 4 ? "Refunded" : t >= 2 ? "Awaiting approval" : t >= 1 ? "AI reviewing" : "New";
  const statusClass = t >= 4 ? "badge-success" : t >= 2 ? "badge-warning" : "badge-neutral";

  return (
    <div className="glass" style={{ padding: 20, minHeight: 330 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 600 }}>Maya R.</div>
          <div className="muted" style={{ fontSize: "0.82rem" }}>Ceramic mug · $24.00</div>
        </div>
        <span className={`badge ${statusClass}`}>{statusLabel}</span>
      </div>

      <div
        style={{
          background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10,
          padding: "10px 12px", fontSize: "0.9rem", color: "var(--text)", marginBottom: 12,
        }}
      >
        &ldquo;The mug arrived cracked. Can I get my money back?&rdquo;
      </div>

      <AnimatePresence mode="popLayout">
        {t >= 1 && (
          <motion.div key="reason" {...rowAnim} style={{ marginBottom: 12 }}>
            <div className="muted" style={{ fontSize: "0.75rem", marginBottom: 4 }}>AI reasoning</div>
            <div style={{ fontSize: "0.86rem", color: "var(--text-muted)" }}>
              Inside the 30-day window. Damage reported. First request from this customer.
            </div>
          </motion.div>
        )}
        {t >= 2 && (
          <motion.div key="rec" {...rowAnim} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
            <span className="badge badge-success">Full refund $24.00</span>
            <span className="badge badge-neutral">High confidence</span>
          </motion.div>
        )}
        {t >= 3 && t < 4 && (
          <motion.div key="approve" {...rowAnim}>
            <motion.div
              animate={reduce ? undefined : { boxShadow: ["0 0 0 0 rgba(110,107,255,0.6)", "0 0 0 10px rgba(110,107,255,0)"] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{
                display: "inline-block", background: "var(--accent)", color: "#fff",
                padding: "8px 16px", borderRadius: 8, fontSize: "0.88rem",
              }}
            >
              Approve refund
            </motion.div>
          </motion.div>
        )}
        {t >= 4 && (
          <motion.div
            key="done"
            {...rowAnim}
            style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--success)", fontSize: "0.9rem" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Refunded through the PayPal sandbox
          </motion.div>
        )}
      </AnimatePresence>

      <div className="muted" style={{ fontSize: "0.72rem", marginTop: 16 }}>Illustration with sample data</div>
    </div>
  );
}