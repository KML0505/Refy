import RequestGrid from "@/components/dashboard/RequestGrid";

export default function DashboardPage() {
  return (
    <div className="container container-wide">
      <div className="eyebrow">Merchant view</div>
      <h1>Resolution queue</h1>
      <p>Review what the AI recommends, then approve. PayPal handles the money.</p>
      <RequestGrid />
    </div>
  );
}