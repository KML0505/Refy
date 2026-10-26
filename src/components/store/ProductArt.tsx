const frame: React.CSSProperties = {
  borderRadius: 6,
  overflow: "hidden",
  border: "1px solid var(--border)",
  marginBottom: 16,
  aspectRatio: "400 / 220",
};

function Mug() {
  return (
    <svg viewBox="0 0 400 220" width="100%" height="100%" role="img" aria-label="Ceramic mug">
      <defs>
        <linearGradient id="mug-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a2850" />
          <stop offset="1" stopColor="#171630" />
        </linearGradient>
        <linearGradient id="mug-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9db0ff" />
          <stop offset="1" stopColor="#5b7cf0" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#mug-bg)" />
      <ellipse cx="205" cy="192" rx="95" ry="12" fill="rgba(0,0,0,0.35)" />
      <path d="M280 98 C330 98 330 152 280 152" fill="none" stroke="#7d97ff" strokeWidth="14" strokeLinecap="round" />
      <path d="M130 72 H280 V162 a25 25 0 0 1 -25 25 H155 a25 25 0 0 1 -25 -25 Z" fill="url(#mug-body)" />
      <ellipse cx="205" cy="72" rx="75" ry="10" fill="#b9c6ff" />
      <ellipse cx="205" cy="72" rx="65" ry="7" fill="#33316a" />
      <rect x="146" y="88" width="10" height="78" rx="5" fill="rgba(255,255,255,0.2)" />
      <g fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeLinecap="round">
        <path d="M185 52 c-9 -10 9 -16 0 -28" />
        <path d="M210 50 c-9 -10 9 -16 0 -28" />
        <path d="M235 52 c-9 -10 9 -16 0 -28" />
      </g>
    </svg>
  );
}

function Print() {
  return (
    <svg viewBox="0 0 400 220" width="100%" height="100%" role="img" aria-label="Art print">
      <defs>
        <linearGradient id="print-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f2d4f" />
          <stop offset="1" stopColor="#171630" />
        </linearGradient>
        <linearGradient id="print-art" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5a524" />
          <stop offset="0.5" stopColor="#d65db1" />
          <stop offset="1" stopColor="#4a3f9f" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#print-bg)" />
      <ellipse cx="200" cy="205" rx="90" ry="8" fill="rgba(0,0,0,0.35)" />
      <rect x="128" y="20" width="144" height="178" rx="4" fill="#0d0c18" stroke="#c9c7ff" strokeWidth="4" />
      <rect x="140" y="32" width="120" height="154" fill="url(#print-art)" />
      <circle cx="200" cy="92" r="22" fill="#ffe2b0" opacity="0.92" />
      <path d="M140 150 L178 112 L204 138 L230 106 L260 150 V186 H140 Z" fill="#2b2468" />
      <path d="M140 166 L174 142 L210 162 L240 140 L260 158 V186 H140 Z" fill="#171433" />
    </svg>
  );
}

function SnackBox() {
  return (
    <svg viewBox="0 0 400 220" width="100%" height="100%" role="img" aria-label="Monthly snack box">
      <defs>
        <linearGradient id="box-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f2250" />
          <stop offset="1" stopColor="#171630" />
        </linearGradient>
        <linearGradient id="box-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3a85e" />
          <stop offset="1" stopColor="#b9772f" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#box-bg)" />
      <ellipse cx="200" cy="200" rx="115" ry="10" fill="rgba(0,0,0,0.35)" />
      {/* snacks peeking out */}
      <circle cx="160" cy="76" r="24" fill="#d9a066" />
      <circle cx="152" cy="70" r="3" fill="#5a3519" />
      <circle cx="168" cy="82" r="3" fill="#5a3519" />
      <circle cx="160" cy="62" r="2.5" fill="#5a3519" />
      <circle cx="208" cy="66" r="19" fill="#e85a6a" />
      <path d="M208 48 q8 -8 14 -6" fill="none" stroke="#3ecf8e" strokeWidth="3" strokeLinecap="round" />
      <path d="M236 98 L258 58 L280 98 Z" fill="#f5c542" />
      {/* box */}
      <path d="M108 106 H292 V188 a8 8 0 0 1 -8 8 H116 a8 8 0 0 1 -8 -8 Z" fill="url(#box-body)" />
      <rect x="98" y="88" width="204" height="26" rx="6" fill="#f0b86e" />
      <rect x="148" y="132" width="104" height="36" rx="6" fill="#fff3e0" opacity="0.95" />
      <text x="200" y="155" textAnchor="middle" fontSize="15" fontWeight="700" fill="#7a4a14" fontFamily="monospace" letterSpacing="2">
        SNACKS
      </text>
    </svg>
  );
}

export default function ProductArt({ id }: { id: string }) {
  return (
    <div style={frame}>
      {id === "print" ? <Print /> : id === "box" ? <SnackBox /> : <Mug />}
    </div>
  );
}