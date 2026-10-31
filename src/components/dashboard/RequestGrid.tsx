"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  colorSchemeDark,
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const gridTheme = themeQuartz.withPart(colorSchemeDark).withParams({
  backgroundColor: "rgba(13, 12, 24, 0.55)",
  foregroundColor: "#e8e7f5",
  borderColor: "#2c2b45",
  headerBackgroundColor: "rgba(36, 35, 58, 0.85)",
  headerTextColor: "#a6a5c7",
  oddRowBackgroundColor: "rgba(255, 255, 255, 0.015)",
  rowHoverColor: "rgba(91, 124, 240, 0.12)",
  selectedRowBackgroundColor: "rgba(91, 124, 240, 0.22)",
  accentColor: "#5b7cf0",
  fontFamily: "var(--font-mono-ui), ui-monospace, monospace",
  fontSize: 13,
  wrapperBorderRadius: 8,
});

type Row = {
  id: string;
  action: string;
  amount_cents: number | null;
  confidence: string;
  reasoning: string;
  policy_clauses: string;
  draft_reply: string;
  status: string;
  created_at: string;
  message: string;
  customer_name: string;
  item_name: string;
  paid_cents: number;
  sub_status: string | null;
};

const ACTIONS: Record<string, { label: string; cls: string }> = {
  refund: { label: "Full refund", cls: "badge-success" },
  partial_refund: { label: "Partial refund", cls: "badge-success" },
  status_reply: { label: "Status reply", cls: "badge-info" },
  pause_subscription: { label: "Pause plan", cls: "badge-neutral" },
  hold: { label: "Hold", cls: "badge-warning" },
  deny: { label: "Deny", cls: "badge-danger" },
};

const STATUSES: Record<string, { label: string; cls: string }> = {
  pending: { label: "Needs approval", cls: "badge-warning" },
  executing: { label: "Working", cls: "badge-info" },
  executed: { label: "Done", cls: "badge-success" },
};

const money = (c: number | null | undefined) =>
  c == null ? "-" : `$${(c / 100).toFixed(2)}`;

function ActionCell(p: ICellRendererParams<Row, string>) {
  const a = ACTIONS[p.value ?? ""];
  return <span className={`badge ${a?.cls ?? "badge-neutral"}`}>{a?.label ?? p.value}</span>;
}

function StatusCell(p: ICellRendererParams<Row, string>) {
  const s = STATUSES[p.value ?? ""];
  return <span className={`badge ${s?.cls ?? "badge-neutral"}`}>{s?.label ?? p.value}</span>;
}

export default function RequestGrid() {
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const latestLoad = useRef(0);
  const confirmedApprovals = useRef(new Map<string, { amountCents?: number }>());

  const load = useCallback(async () => {
    const loadId = ++latestLoad.current;

    try {
      const res = await fetch("/api/decisions", { cache: "no-store" });

      if (res.ok) {
        const freshRows: Row[] = await res.json();

        if (loadId === latestLoad.current) {
          setRows(
            freshRows.map((row) => {
              const confirmed = confirmedApprovals.current.get(row.id);
              if (!confirmed) return row;

              return {
                ...row,
                status: "executed",
                amount_cents: confirmed.amountCents ?? row.amount_cents,
              };
            })
          );
        }
      }
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  const selected = rows.find((r) => r.id === selectedId) ?? null;

  useEffect(() => {
    setError(null);
    setAmount(
      selected?.amount_cents != null
        ? (selected.amount_cents / 100).toFixed(2)
        : ""
    );
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const columnDefs = useMemo<ColDef<Row>[]>(
    () => [
      { field: "created_at", headerName: "Received", width: 170 },
      { field: "customer_name", headerName: "Customer", width: 140 },
      { field: "item_name", headerName: "Item", width: 160 },
      { field: "message", headerName: "Request", flex: 2, minWidth: 240 },
      { field: "action", headerName: "AI recommends", width: 160, cellRenderer: ActionCell },
      {
        field: "amount_cents",
        headerName: "Amount",
        width: 100,
        valueFormatter: (p) => money(p.value),
      },
      { field: "confidence", headerName: "Confidence", width: 120 },
      { field: "status", headerName: "Status", width: 160, cellRenderer: StatusCell },
    ],
    []
  );

  const pending = rows.filter((r) => r.status === "pending").length;
  const done = rows.filter((r) => r.status === "executed").length;
  const refunded = rows
    .filter(
      (r) =>
        r.status === "executed" &&
        r.amount_cents &&
        (r.action === "refund" || r.action === "partial_refund")
    )
    .reduce((sum, r) => sum + (r.amount_cents ?? 0), 0);

  async function approve() {
    if (!selected) return;

    setBusy(true);
    setError(null);

    try {
      const body: { amountCents?: number } = {};

      if (selected.action === "refund" || selected.action === "partial_refund") {
        body.amountCents = Math.round(Number(amount) * 100);
      }

      const res = await fetch(`/api/decisions/${selected.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Failed (${res.status})`);

      // Keep the successful approval visible while polling catches up.
      latestLoad.current++;
      confirmedApprovals.current.set(selected.id, {
        amountCents:
          typeof data.amountCents === "number" ? data.amountCents : undefined,
      });

      setRows((current) =>
        current.map((row) =>
          row.id === selected.id
            ? {
                ...row,
                status: data.status ?? "executed",
                amount_cents:
                  typeof data.amountCents === "number"
                    ? data.amountCents
                    : row.amount_cents,
              }
            : row
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const isRefund =
    selected &&
    (selected.action === "refund" || selected.action === "partial_refund");

  let clauses: string[] = [];
  try {
    clauses = selected ? JSON.parse(selected.policy_clauses || "[]") : [];
  } catch {}

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        }}
      >
        <div className="card">
          <div className="eyebrow">Needs approval</div>
          <div style={{ fontSize: "1.6rem", color: "var(--warning)" }}>{pending}</div>
        </div>
        <div className="card">
          <div className="eyebrow">Resolved</div>
          <div style={{ fontSize: "1.6rem", color: "var(--success)" }}>{done}</div>
        </div>
        <div className="card">
          <div className="eyebrow">Refunded</div>
          <div style={{ fontSize: "1.6rem" }}>{money(refunded)}</div>
        </div>
      </div>

      <div style={{ height: 340, width: "100%" }}>
        <AgGridReact<Row>
          theme={gridTheme}
          rowData={rows}
          columnDefs={columnDefs}
          getRowId={(p) => p.data.id}
          onRowClicked={(e) => e.data && setSelectedId(e.data.id)}
          rowSelection={{ mode: "singleRow", enableClickSelection: true, checkboxes: false }}
        />
      </div>

      {selected ? (
        <section className="glow-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <div>
              <div className="eyebrow">Selected request</div>
              <h2
                style={{
                  textTransform: "none",
                  letterSpacing: "-0.01em",
                  fontSize: "1.2rem",
                  margin: 0,
                }}
              >
                {selected.customer_name}: {selected.item_name} ({money(selected.paid_cents)})
              </h2>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className={`badge ${ACTIONS[selected.action]?.cls ?? "badge-neutral"}`}>
                {ACTIONS[selected.action]?.label ?? selected.action}
              </span>
              <span className="badge badge-neutral">{selected.confidence} confidence</span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            <div>
              <div className="eyebrow">Customer message</div>
              <p style={{ color: "var(--text)" }}>{selected.message}</p>
              <div className="eyebrow">AI reasoning</div>
              <p>{selected.reasoning}</p>

              {clauses.length > 0 && (
                <>
                  <div className="eyebrow">Policy rules used</div>
                  <p>{clauses.join("; ")}</p>
                </>
              )}

              {selected.sub_status && (
                <>
                  <div className="eyebrow">Subscription</div>
                  <p>{selected.sub_status}</p>
                </>
              )}
            </div>

            <div>
              <div className="eyebrow">Draft reply</div>
              <p style={{ color: "var(--text)" }}>{selected.draft_reply}</p>

              {selected.status === "pending" ? (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-end",
                    flexWrap: "wrap",
                    marginTop: 16,
                  }}
                >
                  {isRefund && (
                    <div style={{ width: 130 }}>
                      <label htmlFor="amt">Refund amount ($)</label>
                      <input
                        id="amt"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  )}

                  <button className="btn btn-primary" onClick={approve} disabled={busy}>
                    {busy ? "Working..." : isRefund ? "Approve refund" : "Approve"}
                  </button>
                </div>
              ) : (
                <p style={{ marginTop: 16 }}>
                  Status:{" "}
                  <span className={`badge ${STATUSES[selected.status]?.cls ?? "badge-neutral"}`}>
                    {STATUSES[selected.status]?.label ?? selected.status}
                  </span>
                </p>
              )}

              {error && <p className="error">{error}</p>}
            </div>
          </div>
        </section>
      ) : (
        <p className="muted">Select a row to see the AI&apos;s reasoning and approve.</p>
      )}
    </div>
  );
}