"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  { label: "", links: [{ href: "/", label: "Home" }] },
  {
    label: "Customer",
    links: [
      { href: "/store", label: "Store" },
      { href: "/store/help", label: "Help" },
    ],
  },
  {
    label: "Merchant",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/analytics", label: "Analytics" },
    ],
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="nav-links" style={{ gap: 28 }}>
      {groups.map((g, gi) => (
        <div
          key={gi}
          style={{
            display: "flex", alignItems: "center", gap: 20,
            paddingLeft: gi > 0 ? 28 : 0,
            borderLeft: gi > 0 ? "1px solid var(--border-strong)" : "none",
          }}
        >
          {g.label && (
            <span className="eyebrow" style={{ margin: 0, fontSize: "0.62rem" }}>{g.label}</span>
          )}
          {g.links.map((l) => (
            <Link key={l.href} href={l.href} className={`nav-link${pathname === l.href ? " active" : ""}`}>
              {l.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}