import HelpForm from "@/components/store/HelpForm";

export default function HelpPage() {
  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <div className="eyebrow">Customer support</div>
      <h1>Report a problem</h1>
      <p>Enter the order number shown after your purchase, and tell us what went wrong. The shop owner reviews every request.</p>
      <div className="glow-card" style={{ marginTop: 20 }}>
        <HelpForm />
      </div>
    </div>
  );
}