"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

declare global {
  interface Window {
    paypal?: any;
  }
}

let sdkPromise: Promise<void> | null = null;

function loadPayPalSdk(clientId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.paypal) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Failed to load PayPal SDK"));
    };
    document.body.appendChild(script);
  });
  return sdkPromise;
}

export default function PayPalButton({ productId }: { productId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
      setError("Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID");
      return;
    }

    let cancelled = false;

    loadPayPalSdk(clientId)
      .then(() => {
        if (cancelled || !containerRef.current || !window.paypal) return;
        containerRef.current.innerHTML = "";

        window.paypal
          .Buttons({
            style: {
              layout: "vertical",
              color: "gold",
              shape: "rect",
              borderRadius: 8,
              label: "pay",
              height: 42,
              tagline: false,
            },
            createOrder: async () => {
              const res = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId }),
              });
              const text = await res.text();
              let data: { id?: string; error?: string } = {};
              try {
                data = JSON.parse(text);
              } catch {
                throw new Error(`Server returned ${res.status}: ${text.slice(0, 200) || "(empty body)"}`);
              }
              if (!res.ok || !data.id) {
                throw new Error(data.error ?? `Create order failed (${res.status})`);
              }
              return data.id;
            },
            onApprove: async (data: { orderID: string }) => {
              const res = await fetch("/api/paypal/capture-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID }),
              });
              const result = await res.json();
              if (!res.ok) {
                setError(result.error ?? "Capture failed");
                return;
              }
              setOrderId(result.orderId);
              setMessage("Payment complete.");
            },
            onError: (err: unknown) => {
              console.error(err);
              setError(err instanceof Error ? err.message : "Something went wrong with PayPal.");
            },
          })
          .render(containerRef.current);
      })
      .catch((e) => setError(e.message));

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (message) {
    return (
      <div>
        <span className="badge badge-success">Payment complete</span>
        <p style={{ margin: "10px 0 6px" }}>
          Order number: <code>{orderId}</code>
        </p>
        <Link href="/store/help">Report a problem with this order</Link>
      </div>
    );
  }

  return (
    <div className="pay-box">
      <div ref={containerRef} />
      {error && <p className="error" style={{ margin: "8px 0 0" }}>{error}</p>}
    </div>
  );
}