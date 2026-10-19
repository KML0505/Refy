"use client";

import { useState } from "react";

export default function HelpForm() {
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

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
    return <p>Thanks, your request was sent. The merchant will review it soon.</p>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <label>
        Order number
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8 }}
        />
      </label>
      <label>
        What went wrong?
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          style={{ display: "block", width: "100%", padding: 8 }}
        />
      </label>
      <button onClick={submit} disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Send request"}
      </button>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </div>
  );
}