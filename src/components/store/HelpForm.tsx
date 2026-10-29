"use client";

import { useEffect, useState } from "react";

export default function HelpForm() {
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("order");
    if (id) setOrderId(id);
  }, []);

  async function submit() {
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim(), message }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div>
        <span className="badge badge-success">Request sent</span>
        <p style={{ marginTop: 12, marginBottom: 0 }}>
          Thanks. The shop owner will review it, and you can follow the outcome on the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <label htmlFor="order">Order number</label>
        <input id="order" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Paste your order number" />
                <button
          type="button"
          className="chip"
          style={{ marginTop: 8 }}
          onClick={async () => {
            try {
              setOrderId((await navigator.clipboard.readText()).trim());
            } catch {}
          }}
        >
          Paste from clipboard
        </button>
      </div>
      <div>
        <label htmlFor="msg">What went wrong?</label>
        <textarea id="msg" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Describe the problem" />
      </div>
      <button className="btn btn-primary" onClick={submit} disabled={status === "sending"} style={{ justifyContent: "center" }}>
        {status === "sending" ? "Sending..." : "Submit"}
      </button>
      {error && <p className="error" style={{ margin: 0 }}>{error}</p>}
    </div>
  );
}