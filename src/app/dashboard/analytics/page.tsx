import Link from "next/link";
import AnalyticsClient from "@/components/dashboard/AnalyticsClient";

export default function AnalyticsPage() {
  return (
    <main style={{ padding: 16 }}>
      <p>
        <Link href="/dashboard">Back to queue</Link>
      </p>
      <h1>Analytics</h1>
      <AnalyticsClient />
    </main>
  );
}