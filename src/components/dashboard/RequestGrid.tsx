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

  return (
    <span className={`badge ${a?.cls ?? "badge-neutral"}`}>
      {a?.label ?? p.value}
    </span>
  );
}

function StatusCell(p: ICellRendererParams<Row, string>) {
  const s = STATUSES[p.value ?? ""];

  return (
    <span className={`badge ${s?.cls ?? "badge-neutral"}`}>
      {s?.label ?? p.value}
    </span>
  );
}

export default function RequestGrid() {
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Prevent older polling responses from overwriting newer dashboard data.
  const latestLoadId = useRef(0);

  const load = useCallback(async () => {
    const loadId = ++latestLoadId.current;

    try {
      const res = await fetch("/api/decisions", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!res.ok) {
        throw new Error(`Could not refresh decisions (${res.status})`);
      }

      const freshRows = (await res.json()) as Row[];

      // Only apply the most recent request's result.
      if (loadId === latestLoadId.current) {
        setRows(freshRows);
      }
    } catch (err) {
      console.error("Dashboard refresh failed:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void load();

    const interval = setInterval(() => {
      void load();
    }, 5000);

    return () => clearInterval(interval);
  }, [load]);

  const selected = rows.find((row) => row.id === selectedId) ?? null;

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
      {
        field: "action",
        headerName: "AI recommends",
        width: 160,
        cellRenderer: ActionCell,
      },
      {
        field: "amount_cents",
        headerName: "Amount",
        width: 100,
        valueFormatter: (p) => money(p.value),
      },
      { field: "confidence", headerName: "Confidence", width: 120 },
      {
        field: "status",
        headerName: "Status",
        width: 160,
        cellRenderer: StatusCell,
      },
    ],
    []
  );

  // Dashboard statistics are derived from the same row state as the grid.
  const pending = rows.filter((row) => row.status === "pending").length;

  const done = rows.filter((row) => row.status === "executed").length;

  const refunded = rows
    .filter(
      (row) =>
        row.status === "executed" &&
        row.amount_cents != null &&
        (row.action === "refund" || row.action === "partial_refund")
    )
    .reduce((sum, row) => sum + (row.amount_cents ?? 0), 0);

  async function approve() {
    if (!selected || busy) return;

    setBusy(true);
    setError(null);

    try {
      const body: { amountCents?: number } = {};

      if (
        selected.action === "refund" ||
        selected.action === "partial_refund"
      ) {
        const parsedAmount = Number(amount);

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
          throw new Error("Enter a valid refund amount greater than zero.");
        }

        body.amountCents = Math.round(parsedAmount * 100);

        if (body.amountCents <= 0) {
          throw new Error("The refund amount must be at least $0.01.");
        }
      }

      const res = await fetch(
        `/api/decisions/${encodeURIComponent(selected.id)}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? `Approval failed (${res.status})`);
      }

      // Invalidate any polling request that started before approval completed.
      // Its response must not overwrite the newly updated status.
      latestLoadId.current += 1;

      // Immediately update the row and dashboard statistics.
      setRows((currentRows) =>
        currentRows.map((row) =>
          row.id === selected.id
            ? { ...row, status: "executed" }
            : row
        )
      );

      // Refresh from the server to reconcile the UI with persisted data.
      await load();

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );

      // Re-fetch authoritative data in case the operation partially completed.
      await load();
    } finally {
      setBusy(false);
    }
  }

  const isRefund =
    selected?.action === "refund" ||
    selected?.action === "partial_refund";

  let clauses: string[] = [];

  try {
    clauses = selected
      ? JSON.parse(selected.policy_clauses || "[]")
      : [];
  } catch {
    clauses = [];
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Dashboard statistics */}
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        }}
      >
        <div className="card">
          <div className="eyebrow">Needs approval</div>
          <div
            style={{
              fontSize: "1.6rem",
              color: "var(--warning)",
            }}
          >
            {pending}
          </div>
        </div>

        <div className="card">
          <div className="eyebrow">Resolved</div>
          <div
            style={{
              fontSize: "1.6rem",
              color: "var(--success)",
            }}
          >
            {done}
          </div>
        </div>

        <div className="card">
          <div className="eyebrow">Refunded</div>
          <div style={{ fontSize: "1.6rem" }}>{money(refunded)}</div>
        </div>
      </div>

      {/* Requests table */}
      <div style={{ height: 340, width: "100%" }}>
        <AgGridReact<Row>
          theme={gridTheme}
          rowData={rows}
          columnDefs={columnDefs}
          getRowId={(p) => p.data.id}
          onRowClicked={(event) => {
            if (event.data) setSelectedId(event.data.id);
          }}
          rowSelection={{
            mode: "singleRow",
            enableClickSelection: true,
            checkboxes: false,
          }}
        />
      </div>

      {!loaded && <p className="muted">Loading requests...</p>}

      {/* Selected request details */}
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
                {selected.customer_name}: {selected.item_name} (
                {money(selected.paid_cents)})
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span
                className={`badge ${
                  ACTIONS[selected.action]?.cls ?? "badge-neutral"
                }`}
              >
                {ACTIONS[selected.action]?.label ?? selected.action}
              </span>

              <span className="badge badge-neutral">
                {selected.confidence} confidence
              </span>
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
              <p style={{ color: "var(--text)" }}>
                {selected.draft_reply}
              </p>

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
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={amount}
                        onChange={(event) =>
                          setAmount(event.target.value)
                        }
                        disabled={busy}
                      />
                    </div>
                  )}

                  <button
                    className="btn btn-primary"
                    onClick={approve}
                    disabled={busy}
                  >
                    {busy
                      ? "Working..."
                      : isRefund
                        ? "Approve refund"
                        : "Approve"}
                  </button>
                </div>
              ) : (
                <p style={{ marginTop: 16 }}>
                  Status:{" "}
                  <span
                    className={`badge ${
                      STATUSES[selected.status]?.cls ?? "badge-neutral"
                    }`}
                  >
                    {STATUSES[selected.status]?.label ?? selected.status}
                  </span>
                </p>
              )}

              {error && <p className="error">{error}</p>}
            </div>
          </div>
        </section>
      ) : (
        <p className="muted">
          Select a row to see the AI&apos;s reasoning and approve.
        </p>
      )}
    </div>
  );
}