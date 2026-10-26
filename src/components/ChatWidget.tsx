"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BRAND } from "@/lib/brand";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = ["What's your refund policy?", "How do I report a problem?", "Where is my order?"];
const GREETING = `Hi! I'm the ${BRAND} assistant. I can answer questions about returns and refunds, or check an order if you paste your order number. I can't issue refunds, but I can point you to the right place.`;

function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" aria-hidden="true">
      <defs>
        <linearGradient id="chat-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9db0ff" />
          <stop offset="1" stopColor="#d08cff" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="18" height="18" rx="4" fill="none" stroke="url(#chat-mark)" strokeWidth="2" transform="rotate(45 13 13)" />
      <circle cx="13" cy="13" r="2.8" fill="url(#chat-mark)" />
    </svg>
  );
}

export default function ChatWidget() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }, [messages, busy, open, reduce]);

  // Customer help doesn't belong on the merchant pages.
  if (pathname.startsWith("/dashboard")) return null;

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok) throw new Error(data.error ?? `Failed (${res.status})`);
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setMessages([...next, { role: "assistant", content: `Sorry, I couldn't answer: ${msg}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat-root">
      <AnimatePresence>
        {open && (
          <motion.div
            className="chat-panel"
            role="dialog"
            aria-label={`${BRAND} assistant`}
            initial={reduce ? false : { opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div className="chat-head">
              <Mark size={26} />
              <div className="chat-head-title">
                <strong>{BRAND} assistant</strong>
                <span>● Online</span>
              </div>
              <button className="chat-icon-btn" onClick={() => setOpen(false)} aria-label="Close chat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="chat-body">
              <div className="chat-msg bot">{GREETING}</div>
              {messages.length === 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
                  ))}
                </div>
              )}
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  className={`chat-msg ${m.role === "user" ? "user" : "bot"}`}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {m.content}
                </motion.div>
              ))}
              {busy && (
                <div className="chat-msg bot" style={{ display: "flex", gap: 4, padding: "12px 14px" }} aria-label="Thinking">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", display: "block" }}
                      animate={reduce ? undefined : { y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                    />
                  ))}
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="chat-input">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send(input);
                }}
                placeholder="Ask a question..."
                maxLength={500}
                aria-label="Message"
              />
              <button className="chat-send" onClick={() => send(input)} disabled={busy || !input.trim()} aria-label="Send">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            </div>
            <div className="chat-foot">AI assistant. It can't issue refunds.</div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.94 }}
        animate={
          open || reduce
            ? undefined
            : { boxShadow: ["0 0 0 0 rgba(124,150,255,0.55), 0 10px 30px rgba(91,124,240,0.5)", "0 0 0 14px rgba(124,150,255,0), 0 10px 30px rgba(91,124,240,0.5)"] }
        }
        transition={{ duration: 2, repeat: Infinity }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12Z" />
            <circle cx="9" cy="12" r="0.8" fill="currentColor" />
            <circle cx="13" cy="12" r="0.8" fill="currentColor" />
            <circle cx="17" cy="12" r="0.8" fill="currentColor" />
          </svg>
        )}
      </motion.button>
    </div>
  );
}