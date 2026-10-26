import AnalyticsClient from "@/components/dashboard/AnalyticsClient";

export default function AnalyticsPage() {
  return (
    <div className="analytics-page">
      <div>
        <div className="eyebrow">Merchant view</div>
        <h1>Analytics</h1>
      </div>
      <div className="analytics-body">
        <AnalyticsClient />
      </div>
    </div>
  );
}