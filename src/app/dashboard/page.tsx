import RequestGrid from "@/components/dashboard/RequestGrid";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "24px auto", padding: 16 }}>
      <h1>ResolutionDesk</h1>
      <p><Link href="/dashboard/analytics">Analytics</Link></p>
      <RequestGrid />
    </main>
  );
}