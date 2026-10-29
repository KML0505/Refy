import Link from "next/link";
import { BRAND } from "@/lib/brand";
import NavLinks from "./NavLinks";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
            <defs>
              <linearGradient id="refy-mark" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#7d97ff" />
                <stop offset="1" stopColor="#b45cff" />
              </linearGradient>
            </defs>
            <rect x="3" y="3" width="20" height="20" rx="5" fill="none" stroke="url(#refy-mark)" strokeWidth="2" transform="rotate(45 13 13)" />
            <circle cx="13" cy="13" r="3" fill="url(#refy-mark)" />
          </svg>
          <span>{BRAND}</span>
        </Link>

        <NavLinks />

        <div aria-hidden="true" />
      </div>
    </header>
  );
}