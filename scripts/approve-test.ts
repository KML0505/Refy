import { db } from "../src/lib/db";
import { approveDecision } from "../src/lib/actions/executor";

const id =
  process.argv[2] ??
  (db.prepare("SELECT id FROM decisions WHERE status = 'pending' ORDER BY created_at DESC LIMIT 1").get() as
    | { id: string }
    | undefined)?.id;

if (!id) {
  console.error("No pending decision found.");
  process.exit(1);
}

const cents = process.argv[3] ? Number(process.argv[3]) : undefined;

approveDecision(id, "test-script", cents)
  .then(() => console.log("Approved and executed:", id))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });