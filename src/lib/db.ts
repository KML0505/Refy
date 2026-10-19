import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "resolutiondesk.db");

const globalForDb = globalThis as unknown as { db?: Database.Database };

export const db = globalForDb.db ?? new Database(dbPath);
if (process.env.NODE_ENV !== "production") globalForDb.db = db;

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    merchant_type TEXT NOT NULL DEFAULT 'product',
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    item_name TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'paid',
    paypal_order_id TEXT,
    paypal_capture_id TEXT,
    details TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id),
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL REFERENCES requests(id),
    action TEXT NOT NULL,
    amount_cents INTEGER,
    confidence TEXT,
    reasoning TEXT,
    policy_clauses TEXT NOT NULL DEFAULT '[]',
    draft_reply TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    approved_by TEXT,
    paypal_refund_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);