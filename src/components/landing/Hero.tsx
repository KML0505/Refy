"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { BRAND, TAGLINE } from "@/lib/brand";

const letters = BRAND.toUpperCase().split("");

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.2 } },
};
const letter = {
  hidden: { opacity: 0, y: 80, filter: "blur(16px)" },
  show: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 80, damping: 13 },
  },
};

export default function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className="hero-full">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-grid" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <motion.div
        className="hero-glow"
        aria-hidden="true"
        animate={reduce ? undefined : { scale: [1, 1.15, 1], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.h1
        className="hero-title"
        aria-label={BRAND}
        variants={container}
        initial={reduce ? false : "hidden"}
        animate="show"
      >
        {letters.map((l, i) => (
          <motion.span key={i} variants={letter} className="gradient-text" style={{ display: "inline-block" }}>
            {l}
          </motion.span>
        ))}
      </motion.h1>

      <motion.p
        className="hero-sub"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1 }}
      >
        <strong style={{ color: "var(--text)" }}>{TAGLINE}.</strong> {BRAND} reads each complaint, checks your policy, and
        recommends what to do. You approve, and PayPal handles the money.
      </motion.p>

      <motion.div
        style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 28 }}
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.2 }}
      >
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
          <Link href="/store" className="btn btn-primary">Try the demo store</Link>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
          <Link href="/dashboard" className="btn">Open the dashboard</Link>
        </motion.div>
      </motion.div>

      <a href="#demo" className="scroll-cue" aria-label="Scroll to learn more">
        <span>Scroll</span>
        <motion.svg
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="m6 9 6 6 6-6" />
        </motion.svg>
      </a>
    </section>
  );
}