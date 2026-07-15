import { useState } from "react";
import { C } from "../assets/tokens.js";

/* ─── FONT / GLOBAL (safe to double-import; harmless if landing.jsx already loaded it) ─── */
export const AdminFontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
    .admin-scope, .admin-scope *, .admin-scope *::before, .admin-scope *::after { box-sizing: border-box; }
    .admin-scope { font-family: 'Inter', sans-serif; }
    .admin-scope ::-webkit-scrollbar { width: 8px; height: 8px; }
    .admin-scope ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 8px; }
    @keyframes adminSpin { to { transform: rotate(360deg); } }
    @keyframes adminFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  `}</style>
);

/* ─── SPINNER ─── */
export function Spinner({ size = 20, color = C.navy }) {
  return (
    <span
      style={{
        display: "inline-block", width: size, height: size,
        border: `2.5px solid ${color}22`, borderTopColor: color,
        borderRadius: "50%", animation: "adminSpin 0.7s linear infinite",
      }}
    />
  );
}

/* ─── PAGE HEADER ─── */
export function PageHeader({ title, subtitle, badge }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.7rem", fontWeight: 700, letterSpacing: "-0.03em", color: C.navy }}>
          {title}
        </h1>
        {badge > 0 && (
          <span style={{ background: C.gold, color: "#fff", fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: 100 }}>
            {badge} pending
          </span>
        )}
      </div>
      {subtitle && <p style={{ color: C.muted, fontSize: "0.9rem", marginTop: 6, maxWidth: 560, lineHeight: 1.6 }}>{subtitle}</p>}
    </div>
  );
}

/* ─── STATUS PILL ─── */
const PILL_STYLES = {
  PENDING: { bg: "#FFF6E0", fg: "#8A6C1D" },
  VERIFIED: { bg: "#EAF3DE", fg: "#3B6D11" },
  APPROVED: { bg: "#EAF3DE", fg: "#3B6D11" },
  REJECTED: { bg: "#FBE9E7", fg: "#B3261E" },
  SUSPENDED: { bg: "#FBE9E7", fg: "#B3261E" },
  ACTIVE: { bg: "#EAF3DE", fg: "#3B6D11" },
  DEACTIVATED: { bg: "#F1F1EF", fg: "#5F5E5A" },
};
export function StatusPill({ status }) {
  const s = PILL_STYLES[status] || { bg: "#F1F1EF", fg: C.muted };
  return (
    <span style={{ background: s.bg, color: s.fg, fontSize: "0.68rem", fontWeight: 700, padding: "3px 10px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

/* ─── EMPTY STATE ─── */
export function EmptyState({ icon = "✓", title, desc }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", border: `1.5px dashed ${C.border}`, borderRadius: 16, background: C.cream }}>
      <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: C.navy, fontSize: "1.05rem", marginBottom: 6 }}>{title}</div>
      {desc && <div style={{ color: C.muted, fontSize: "0.85rem", maxWidth: 360, margin: "0 auto", lineHeight: 1.6 }}>{desc}</div>}
    </div>
  );
}

/* ─── ERROR BANNER ─── */
export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#FBE9E7", border: "1px solid #f3c6c1", color: "#B3261E", borderRadius: 10, padding: "12px 16px", fontSize: "0.85rem", marginBottom: 20 }}>
      <span>⚠ {message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{ background: "none", border: "none", color: "#B3261E", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline" }}>
          Retry
        </button>
      )}
    </div>
  );
}

/* ─── BUTTON ─── */
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
        opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 8,
        transition: "all 0.15s ease", whiteSpace: "nowrap", ...extra,
      }}
    >
      {loading && <Spinner size={13} color={variant === "outline" || variant === "ghost" ? C.navy : "#fff"} />}
      {children}
    </button>
  );
}

/* ─── MODAL SHELL ─── */
function ModalShell({ onClose, children, width = 440 }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(12,35,64,0.45)", backdropFilter: "blur(3px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "adminFadeIn 0.15s ease both" }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: width, padding: 28, boxShadow: "0 20px 60px rgba(12,35,64,0.25)" }}>
        {children}
      </div>
    </div>
  );
}

/* ─── CONFIRM MODAL (e.g. Approve) ─── */
export function ConfirmModal({ title, desc, confirmLabel = "Confirm", variant = "primary", loading, onConfirm, onClose }) {
  return (
    <ModalShell onClose={loading ? () => {} : onClose}>
      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.15rem", fontWeight: 700, color: C.navy, marginBottom: 10 }}>{title}</h3>
      <p style={{ color: C.muted, fontSize: "0.88rem", lineHeight: 1.6, marginBottom: 24 }}>{desc}</p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="ghost" onClick={onClose} disabled={loading}>Cancel</Btn>
        <Btn variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Btn>
      </div>
    </ModalShell>
  );
}

/* ─── REASON MODAL (Reject / Suspend / Deactivate) ─── */
export function ReasonModal({ title, desc, confirmLabel = "Submit", placeholder = "Explain why...", loading, onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();
  return (
    <ModalShell onClose={loading ? () => {} : onClose}>
      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.15rem", fontWeight: 700, color: C.navy, marginBottom: 8 }}>{title}</h3>
      {desc && <p style={{ color: C.muted, fontSize: "0.85rem", lineHeight: 1.6, marginBottom: 16 }}>{desc}</p>}
      <textarea
        autoFocus
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={placeholder}
        rows={4}
        style={{
          width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 12,
          fontSize: "0.87rem", fontFamily: "'Inter', sans-serif", color: C.navy, resize: "vertical",
          outline: "none", marginBottom: 20,
        }}
        onFocus={(e) => (e.target.style.borderColor = C.gold)}
        onBlur={(e) => (e.target.style.borderColor = C.border)}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="ghost" onClick={onClose} disabled={loading}>Cancel</Btn>
        <Btn variant="danger" onClick={() => onConfirm(trimmed)} disabled={!trimmed} loading={loading}>{confirmLabel}</Btn>
      </div>
    </ModalShell>
  );
}

/* ─── SIMPLE CARD WRAPPER ─── */
export function Card({ children, style = {} }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, ...style }}>
      {children}
    </div>
  );
}

/* ─── TAG ─── */
export function Tag({ children }) {
  return (
    <span style={{ background: C.cream, color: C.navy, fontSize: "0.68rem", fontWeight: 600, padding: "3px 9px", borderRadius: 5, border: `1px solid ${C.border}` }}>
      {children}
    </span>
  );
}

/* ─── TIME AGO ─── */
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
