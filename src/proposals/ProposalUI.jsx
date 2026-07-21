import { useState } from "react";
import { C } from "../assets/tokens.js";

export const ProposalFontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
    @keyframes propSpin { to { transform: rotate(360deg); } }
    @keyframes propFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  `}</style>
);

export function Spinner({ size = 18, color = C.navy }) {
  return (
    <span style={{ display: "inline-block", width: size, height: size, border: `2.5px solid ${color}22`, borderTopColor: color, borderRadius: "50%", animation: "propSpin 0.7s linear infinite" }} />
  );
}

const PILL_STYLES = {
  PENDING: { bg: "#FFF6E0", fg: "#8A6C1D" },
  INTERESTED: { bg: "#EAF3DE", fg: "#3B6D11" },
  NOT_INTERESTED: { bg: "#FBE9E7", fg: "#B3261E" },
  NEW: { bg: C.goldPale, fg: "#7A5C25" },
};
export function StatusPill({ status, label }) {
  const s = PILL_STYLES[status] || { bg: "#F1F1EF", fg: C.muted };
  return (
    <span style={{ background: s.bg, color: s.fg, fontSize: "0.68rem", fontWeight: 700, padding: "3px 10px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
      {label || status.replace("_", " ")}
    </span>
  );
}

export function Tag({ children }) {
  return (
    <span style={{ background: C.cream, color: C.navy, fontSize: "0.68rem", fontWeight: 600, padding: "3px 9px", borderRadius: 5, border: `1px solid ${C.border}` }}>
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, desc }) {
  return (
    <div style={{ textAlign: "center", padding: "70px 20px", border: `1.5px dashed ${C.border}`, borderRadius: 16, background: C.cream }}>
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "center", color: C.muted2 }}>{icon}</div>
      <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: C.navy, fontSize: "1.02rem", marginBottom: 6 }}>{title}</div>
      {desc && <div style={{ color: C.muted, fontSize: "0.84rem", maxWidth: 360, margin: "0 auto", lineHeight: 1.6 }}>{desc}</div>}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#FBE9E7", border: "1px solid #f3c6c1", color: "#B3261E", borderRadius: 10, padding: "12px 16px", fontSize: "0.85rem", marginBottom: 20 }}>
      <span>⚠ {message}</span>
      {onRetry && <button onClick={onRetry} style={{ background: "none", border: "none", color: "#B3261E", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline" }}>Retry</button>}
    </div>
  );
}

export function InfoBanner({ tone = "gold", children }) {
  const styles = tone === "gold"
    ? { bg: C.goldPale, border: `1px solid ${C.gold}44`, fg: "#7A5C25" }
    : { bg: "#EAF3DE", border: "1px solid #cfe3ba", fg: "#3B6D11" };
  return (
    <div style={{ background: styles.bg, border: styles.border, color: styles.fg, borderRadius: 10, padding: "10px 14px", fontSize: "0.83rem", lineHeight: 1.55, marginBottom: 16 }}>
      {children}
    </div>
  );
}

export function Btn({ children, variant = "primary", size = "default", onClick, disabled, loading, type = "button", style: extra = {} }) {
  const [hov, setHov] = useState(false);
  const pad = size === "sm" ? "7px 16px" : "10px 22px";
  const fs = size === "sm" ? "0.78rem" : "0.86rem";
  const variants = {
    primary: { background: C.navy, color: "#fff", border: "none" },
    gold: { background: C.gold, color: "#fff", border: "none" },
    danger: { background: hov ? "#B3261E" : "#fff", color: hov ? "#fff" : "#B3261E", border: "1.5px solid #B3261E" },
    outline: { background: hov ? C.cream : "#fff", color: C.navy, border: `1.5px solid ${C.border}` },
    ghost: { background: hov ? C.cream : "transparent", color: C.navy, border: "none" },
  };
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...variants[variant], padding: pad, fontSize: fs, fontWeight: 700, borderRadius: 8,
        cursor: disabled || loading ? "not-allowed" : "pointer", fontFamily: "'Inter', sans-serif",
        opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "all 0.15s ease", whiteSpace: "nowrap", ...extra,
      }}
    >
      {loading && <Spinner size={13} color={variant === "outline" || variant === "ghost" ? C.navy : "#fff"} />}
      {children}
    </button>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, ...style }}>
      {children}
    </div>
  );
}

export function Modal({ onClose, children, width = 480 }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(12,35,64,0.45)", backdropFilter: "blur(3px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "propFadeIn 0.15s ease both" }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: width, padding: 28, boxShadow: "0 20px 60px rgba(12,35,64,0.25)", maxHeight: "88vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}

export function Toast({ message, tone = "error" }) {
  if (!message) return null;
  const bg = tone === "error" ? "#B3261E" : C.navy;
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: bg, color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: "0.82rem", zIndex: 1100, maxWidth: "90vw" }}>
      {message}
    </div>
  );
}

export function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export const COLLAB_TYPES = ["Mentorship", "Partnership", "Investment"];
