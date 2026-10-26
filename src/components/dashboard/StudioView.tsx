"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AgStudio, AgStudioProvider, AgStudioRef } from "ag-studio-react";
import savedState from "@/lib/studioState.json";
import { studioTheme } from "ag-studio";
import type { AgStudioTheme } from "ag-studio";

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

const ACTION_LABELS: Record<string, string> = {
  refund: "Full refund",
  partial_refund: "Partial refund",
  status_reply: "Status reply",
  pause_subscription: "Pause subscription",
  hold: "Hold for review",
  deny: "Deny",
};

const TRACKS = 68; // total layout rows in the saved dashboard

export default function StudioView() {
  const studioRef = useRef<AgStudioRef>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<DecisionRow[] | null>(null);
  const [mode, setMode] = useState<"edit" | "view" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stateJson, setStateJson] = useState<string | null>(null);
  const [boxH, setBoxH] = useState(0);

  useEffect(() => {
    setMode(new URLSearchParams(window.location.search).get("edit") ? "edit" : "view");
    fetch("/api/decisions", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Failed (${r.status})`))))
      .then(setRows)
      .catch((e) => setError(e.message));
  }, []);

  // Measure the available height so the whole dashboard fits without scrolling.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setBoxH(Math.floor(entry.contentRect.height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [rows, mode]);

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
            action: ACTION_LABELS[r.action] ?? r.action,
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

  const layout = useMemo(
    () => ({ rowHeight: boxH > 0 ? Math.max(6, Math.floor((boxH - 16) / TRACKS)) : 10 }),
    [boxH]
  );

  // No filter bar: view mode shows no side panels, edit mode shows the builder panels only.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const panels = useMemo<any>(() => ({ edit: { right: ["edit", "data"] }, view: { left: [], right: [] } }), []);

  // Match the site font. Resolve the real font name at runtime, because canvas charts can't read CSS variables.
  const theme = useMemo<AgStudioTheme>(() => {
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-mono-ui").trim();
    return studioTheme.withParams({
      fontFamily: mono ? `${mono}, ui-monospace, monospace` : "ui-monospace, monospace",
    });
  }, []);

  function copyState() {
    const state = studioRef.current?.api.getState();
    const json = JSON.stringify(state, null, 2);
    setStateJson(json);
    navigator.clipboard?.writeText(json).catch(() => {});
  }

  if (error) return <p className="error">{error}</p>;
  if (!rows || !mode) return <p className="muted">Loading data...</p>;

  const licenseKey = process.env.NEXT_PUBLIC_AG_STUDIO_LICENSE;

  const studio = (
    <AgStudio
      ref={studioRef as never}
      style={{ height: "100%", width: "100%" }}
      data={data}
      mode={mode}
      theme={theme}
      layout={layout}
      panels={panels}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialState={(savedState as any) ?? undefined}
    />
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 8 }}>
      {mode === "edit" && (
        <div>
          <button className="btn" onClick={copyState}>Copy dashboard state</button>
          {stateJson && (
            <textarea readOnly value={stateJson} rows={4} style={{ marginTop: 8, fontFamily: "inherit", fontSize: "0.75rem" }} />
          )}
        </div>
      )}
      <div
        ref={bodyRef}
        className="ag-theme-mode studio-shell"
        data-ag-theme-mode="dark-blue"
        style={{ flex: 1, minHeight: 0, width: "100%" }}
      >
        {licenseKey ? <AgStudioProvider licenseKey={licenseKey}>{studio}</AgStudioProvider> : studio}
      </div>
    </div>
  );
}