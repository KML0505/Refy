"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/store", label: "Store" },
  { href: "/store/help", label: "Help" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/analytics", label: "Analytics" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="nav-links">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`nav-link${pathname === l.href ? " active" : ""}`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}