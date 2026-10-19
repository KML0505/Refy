"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

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
};

const money = (c: number | null | undefined) =>
  c == null ? "-" : `$${(c / 100).toFixed(2)}`;

export default function RequestGrid() {
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/decisions", { cache: "no-store" });
    if (res.ok) setRows(await res.json());
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  const selected = rows.find((r) => r.id === selectedId) ?? null;

  useEffect(() => {
    setError(null);
    setAmount(selected?.amount_cents != null ? (selected.amount_cents / 100).toFixed(2) : "");
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const columnDefs = useMemo<ColDef<Row>[]>(
    () => [
      { field: "created_at", headerName: "Received", width: 160 },
      { field: "customer_name", headerName: "Customer", width: 150 },
      { field: "item_name", headerName: "Item", width: 150 },
      { field: "message", headerName: "Request", flex: 2, minWidth: 220 },
      { field: "action", headerName: "AI recommends", width: 160 },
      {
        field: "amount_cents",
        headerName: "Amount",
        width: 110,
        valueFormatter: (p) => money(p.value),
      },
      { field: "confidence", headerName: "Confidence", width: 120 },
      { field: "status", headerName: "Status", width: 120 },
    ],
    []
  );

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
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const isRefund = selected && (selected.action === "refund" || selected.action === "partial_refund");

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ height: 380, width: "100%" }}>
        <AgGridReact<Row>
          rowData={rows}
          columnDefs={columnDefs}
          getRowId={(p) => p.data.id}
          onRowClicked={(e) => e.data && setSelectedId(e.data.id)}
          rowSelection={{ mode: "singleRow", enableClickSelection: true, checkboxes: false }}
        />
      </div>

      {selected ? (
        <section style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16 }}>
          <h2>
            {selected.customer_name}: {selected.item_name} ({money(selected.paid_cents)})
          </h2>
          <p><strong>Customer message:</strong> {selected.message}</p>
          <p><strong>AI recommends:</strong> {selected.action} ({selected.confidence} confidence)</p>
          <p><strong>Reasoning:</strong> {selected.reasoning}</p>
          <p><strong>Policy rules used:</strong> {JSON.parse(selected.policy_clauses || "[]").join("; ")}</p>
          <p><strong>Draft reply:</strong> {selected.draft_reply}</p>

          {selected.status === "pending" ? (
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {isRefund && (
                <label>
                  Refund amount ($){" "}
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ width: 80, padding: 4 }}
                  />
                </label>
              )}
              <button onClick={approve} disabled={busy}>
                {busy ? "Working..." : isRefund ? "Approve refund" : "Approve"}
              </button>
            </div>
          ) : (
            <p><strong>Status:</strong> {selected.status}</p>
          )}
          {error && <p style={{ color: "crimson" }}>{error}</p>}
        </section>
      ) : (
        <p>Select a row to see the AI's reasoning.</p>
      )}
    </div>
  );
}