import HelpForm from "@/components/store/HelpForm";

export default function HelpPage() {
  return (
    <main style={{ maxWidth: 480, margin: "40px auto", padding: 16 }}>
      <h1>Need help with an order?</h1>
      <HelpForm />
    </main>
  );
}