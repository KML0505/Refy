import { db } from "../src/lib/db";

type Seed = {
  name: string;
  email: string;
  item: string;
  cents: number;
  purchasedDaysAgo: number;
  requestDaysAgo: number;
  tracking?: { carrier: string; number: string; status: string; eta: string };
  message: string;
  action: string;
  amount: number | null;
  confidence: "low" | "medium" | "high";
  reasoning: string;
  clauses: string[];
  reply: string;
  status: "pending" | "executed";
};

const seeds: Seed[] = [
  {
    name: "Priya N.", email: "priya@example.com", item: "Ceramic mug", cents: 2400,
    purchasedDaysAgo: 9, requestDaysAgo: 8,
    message: "The mug arrived cracked right down the side. Can I get my money back?",
    action: "refund", amount: 2400, confidence: "high",
    reasoning: "Damaged item reported 1 day after delivery, well inside the 30-day window. First request from this customer.",
    clauses: ["Rule 1: refunds within 30 days", "Rule 2: damaged items get a full refund"],
    reply: "Sorry the mug arrived damaged. Your full refund of $24.00 has been approved.",
    status: "executed",
  },
  {
    name: "Tom W.", email: "tom@example.com", item: "Art print", cents: 3500,
    purchasedDaysAgo: 7, requestDaysAgo: 0,
    tracking: { carrier: "PostalCo", number: "PC-SAMPLE-1042", status: "In transit", eta: "2 days" },
    message: "Where is my order? It has been a week and nothing has arrived.",
    action: "status_reply", amount: null, confidence: "high",
    reasoning: "No refund requested. Tracking shows the parcel is in transit with an estimated delivery in 2 days.",
    clauses: ["Rule 5: status questions get a tracking reply"],
    reply: "Thanks for your patience. Your print is in transit with PostalCo (PC-SAMPLE-1042) and should arrive in about 2 days.",
    status: "pending",
  },
  {
    name: "Marcus L.", email: "marcus@example.com", item: "Art print", cents: 3500,
    purchasedDaysAgo: 12, requestDaysAgo: 11,
    message: "I changed my mind, the colors are not what I expected. Can I return it?",
    action: "partial_refund", amount: 2625, confidence: "high",
    reasoning: "Change of mind at day 1 of the request, inside 14 days. Policy gives 75% of the price.",
    clauses: ["Rule 3: change of mind within 14 days gets a 75% refund"],
    reply: "We can refund 75% of your purchase, $26.25. This has been approved.",
    status: "executed",
  },
  {
    name: "Dana K.", email: "dana@example.com", item: "Monthly snack box", cents: 1900,
    purchasedDaysAgo: 3, requestDaysAgo: 0,
    message: "Refund me again. This is the fifth time this month the box was wrong.",
    action: "hold", amount: null, confidence: "medium",
    reasoning: "The customer reports repeated refund requests this month. Policy requires review at 3 or more.",
    clauses: ["Rule 7: 3 or more requests in 30 days are held for review"],
    reply: "Thanks for contacting us. A team member will review your request and follow up.",
    status: "pending",
  },
  {
    name: "Chen Y.", email: "chen@example.com", item: "Ceramic mug", cents: 2400,
    purchasedDaysAgo: 41, requestDaysAgo: 1,
    message: "My mug arrived cracked. I never got around to reporting it.",
    action: "deny", amount: null, confidence: "high",
    reasoning: "The purchase was 41 days ago, outside the 30-day refund window.",
    clauses: ["Rule 1: refunds only within 30 days"],
    reply: "We're sorry about the mug. Unfortunately it is outside our 30-day refund window.",
    status: "executed",
  },
  {
    name: "Lena B.", email: "lena@example.com", item: "Art print", cents: 3500,
    purchasedDaysAgo: 2, requestDaysAgo: 0,
    message: "this is bad",
    action: "hold", amount: null, confidence: "low",
    reasoning: "The message doesn't say what is wrong, so there is not enough information to decide.",
    clauses: ["Rule 9: unclear requests are held with low confidence"],
    reply: "Thanks for reaching out. Could you tell us what went wrong with your order?",
    status: "pending",
  },
  {
    name: "Omar S.", email: "omar@example.com", item: "Ceramic mug", cents: 2400,
    purchasedDaysAgo: 6, requestDaysAgo: 0,
    tracking: { carrier: "PostalCo", number: "PC-SAMPLE-2210", status: "Delivered", eta: "Delivered 2 days ago" },
    message: "Tracking says delivered but I never received it.",
    action: "hold", amount: null, confidence: "medium",
    reasoning: "Tracking shows delivered, which conflicts with the customer's claim. A person should check with the carrier.",
    clauses: ["Rule 9: conflicting or unclear information is held"],
    reply: "We're sorry. We're checking with the carrier and will update you shortly.",
    status: "pending",
  },
  {
    name: "Grace P.", email: "grace@example.com", item: "Monthly snack box", cents: 1900,
    purchasedDaysAgo: 15, requestDaysAgo: 4,
    tracking: { carrier: "PostalCo", number: "PC-SAMPLE-3302", status: "Delayed", eta: "3 days" },
    message: "My box hasn't arrived. Where is it?",
    action: "status_reply", amount: null, confidence: "high",
    reasoning: "Status question. Tracking shows a delay with a new estimate of 3 days.",
    clauses: ["Rule 5: status questions get a tracking reply"],
    reply: "Your box is delayed but moving, and should arrive in about 3 days.",
    status: "executed",
  },
  {
    name: "Ravi M.", email: "ravi@example.com", item: "Art print", cents: 3500,
    purchasedDaysAgo: 8, requestDaysAgo: 6,
    message: "The glass in the frame shattered in transit.",
    action: "refund", amount: 3500, confidence: "high",
    reasoning: "Damaged on arrival, inside the window, first request from this customer.",
    clauses: ["Rule 1: refunds within 30 days", "Rule 2: damaged items get a full refund"],
    reply: "Sorry about the broken frame. Your full refund of $35.00 has been approved.",
    status: "executed",
  },
  {
    name: "Sofia T.", email: "sofia@example.com", item: "Ceramic mug", cents: 2400,
    purchasedDaysAgo: 25, requestDaysAgo: 2,
    message: "The handle fell off after only a few uses.",
    action: "refund", amount: 2400, confidence: "medium",
    reasoning: "Defective item reported inside 30 days. Use after delivery lowers confidence slightly.",
    clauses: ["Rule 1: refunds within 30 days", "Rule 2: defective items get a full refund"],
    reply: "Sorry the handle broke. Your full refund of $24.00 has been approved.",
    status: "executed",
  },
  {
    name: "Ben H.", email: "ben@example.com", item: "Monthly snack box", cents: 1900,
    purchasedDaysAgo: 5, requestDaysAgo: 0,
    tracking: { carrier: "PostalCo", number: "PC-SAMPLE-4417", status: "Label created", eta: "Ships tomorrow" },
    message: "Where's my snack box? Haven't heard anything.",
    action: "status_reply", amount: null, confidence: "high",
    reasoning: "Status question. The label was created but the parcel hasn't shipped yet.",
    clauses: ["Rule 5: status questions get a tracking reply"],
    reply: "Your box has a shipping label and goes out tomorrow. We'll send tracking updates.",
    status: "pending",
  },
];

const run = db.transaction(() => {
  db.prepare("DELETE FROM decisions WHERE id LIKE 'seed-%'").run();
  db.prepare("DELETE FROM requests WHERE id LIKE 'seed-%'").run();
  db.prepare("DELETE FROM orders WHERE id LIKE 'seed-%'").run();

  const insOrder = db.prepare(
    `INSERT INTO orders (id, merchant_type, customer_name, customer_email, item_name, amount_cents, status, details, created_at)
     VALUES (?, 'product', ?, ?, ?, ?, 'paid', ?, datetime('now', ?))`
  );
  const insReq = db.prepare(
    `INSERT INTO requests (id, order_id, message, status, created_at)
     VALUES (?, ?, ?, ?, datetime('now', ?))`
  );
  const insDec = db.prepare(
    `INSERT INTO decisions (id, request_id, action, amount_cents, confidence, reasoning, policy_clauses, draft_reply, status, approved_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`
  );

  seeds.forEach((s, i) => {
    const n = i + 1;
    const details = JSON.stringify(s.tracking ? { tracking: s.tracking } : {});
    insOrder.run(`seed-o-${n}`, s.name, s.email, s.item, s.cents, details, `-${s.purchasedDaysAgo} days`);
    insReq.run(`seed-r-${n}`, `seed-o-${n}`, s.message, s.status === "executed" ? "resolved" : "triaged", `-${s.requestDaysAgo} days`);
    insDec.run(
      `seed-d-${n}`, `seed-r-${n}`, s.action, s.amount, s.confidence, s.reasoning,
      JSON.stringify(s.clauses), s.reply, s.status,
      s.status === "executed" ? "merchant" : null, `-${s.requestDaysAgo} days`
    );
  });
});

run();
console.log(`Seeded ${seeds.length} sample cases.`);