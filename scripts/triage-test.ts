import { db } from "../src/lib/db";
import { triageRequest } from "../src/lib/ai/triage";

const id =
  process.argv[2] ??
  (db.prepare("SELECT id FROM requests ORDER BY created_at DESC LIMIT 1").get() as { id: string } | undefined)?.id;

if (!id) {
  console.error("No requests found. Submit one at /store/help first.");
  process.exit(1);
}

triageRequest(id)
  .then((d) => console.log("Decision:", d))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });