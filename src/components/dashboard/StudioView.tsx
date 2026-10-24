"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AgStudio, AgStudioRef } from "ag-studio-react";
import savedState from "@/lib/studioState.json";

type DecisionRow = {
  id: string;
  action: string;
  amount_cents: number | null;
  confidence: string;
  status: string;
  created_at: string;
  message: string;
  customer_name: string;
  item_name: string;
  paid_cents: number;
};

export default function StudioView() {
  // FIX: Change AgStudioRef to AgStudio (or `any` if the library exports them differently)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const studioRef = useRef<any>(null);
  const [rows, setRows] = useState<DecisionRow[] | null>(null);
  const [mode, setMode] = useState<"edit" | "view" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stateJson, setStateJson] = useState<string | null>(null);

  useEffect(() => {
    // ?edit=1 opens the builder. Without it, the saved dashboard shows in view mode.
    setMode(new URLSearchParams(window.location.search).get("edit") ? "edit" : "view");
    fetch("/api/decisions", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Failed (${r.status})`))))
      .then(setRows)
      .catch((e) => setError(e.message));
  }, []);

  const ACTION_LABELS: Record<string, string> = {
    refund: "Full refund",
    partial_refund: "Partial refund",
    status_reply: "Status reply",
    pause_subscription: "Pause subscription",
    hold: "Hold for review",
    deny: "Deny",
  };

  const data = useMemo(
    () => ({
      sources: [
        {
          id: "decisions",
          data: (rows ?? []).map((r) => ({
            received: r.created_at,
            requests: 1,
            customer: r.customer_name,
            item: r.item_name,
            request: r.message,
            action: r.action,
            confidence: r.confidence,
            status: r.status,
            refundedDollars: r.status === "executed" && r.amount_cents ? r.amount_cents / 100 : 0,
            paidDollars: r.paid_cents / 100,
          })),
        },
      ],
    }),
    [rows]
  );

  function copyState() {
    const state = studioRef.current?.api.getState();
    const json = JSON.stringify(state, null, 2);
    setStateJson(json);
    navigator.clipboard?.writeText(json).catch(() => {});
  }

  if (error) return <p style={{ color: "crimson" }}>{error}</p>;
  if (!rows || !mode) return <p>Loading data...</p>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {mode === "edit" && (
        <div>
          <button onClick={copyState}>Copy dashboard state</button>
          {stateJson && (
            <textarea
              readOnly
              value={stateJson}
              rows={6}
              style={{ display: "block", width: "100%", marginTop: 8, fontFamily: "monospace" }}
            />
          )}
        </div>
      )}
      <div style={{ height: "calc(100vh - 180px)", minHeight: 720, width: "100%" }}>
        <AgStudio
          ref={studioRef}
          data={data}
          mode={mode}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialState={(savedState as any) ?? undefined}
        />
      </div>
    </div>
  );
}