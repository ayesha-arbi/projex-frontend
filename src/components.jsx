// components.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { colors as C, fonts, fontSizes, fontWeights, radius, spacing } from "./assets/tokens";

// ---------- OriginBtn (Button) ----------
function getCoverDiameter(w, h, x, y) {
  return Math.ceil(2 * Math.max(Math.hypot(x, y), Math.hypot(w - x, y), Math.hypot(x, h - y), Math.hypot(w - x, h - y)));
}

export function Button({ children, variant = "primary", size = "default", onClick, type = "button", style: extra = {}, disabled = false }) {
  const btnRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [coverSize, setCoverSize] = useState(0);
  const showFill = (hovered || pressed) && !disabled;

  const updateOrigin = useCallback((x, y) => {
    const node = btnRef.current;
    if (!node) return;
    const r = node.getBoundingClientRect();
    setOrigin({ x, y });
    setCoverSize(getCoverDiameter(r.width, r.height, x, y));
  }, []);

  useEffect(() => {
    const node = btnRef.current;
    if (!(node && showFill)) return;
    const measure = () => {
      const r = node.getBoundingClientRect();
      setCoverSize(getCoverDiameter(r.width, r.height, origin.x, origin.y));
    };
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(node);
    return () => obs.disconnect();
  }, [showFill, origin.x, origin.y]);

  const pad = size === "lg" ? "16px 36px" : size === "sm" ? "10px 22px" : "13px 30px";
  const fs = size === "lg" ? "1rem" : size === "sm" ? "0.82rem" : "0.9rem";

  const base = {
    position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 8, overflow: "hidden", borderRadius: "50px", cursor: disabled ? "not-allowed" : "pointer", border: "none",
    padding: pad, fontSize: fs, fontFamily: "'Inter', sans-serif", fontWeight: 600,
    letterSpacing: "-0.01em", transition: "transform 0.15s ease, box-shadow 0.15s ease",
    transform: pressed && !disabled ? "scale(0.975)" : "none", userSelect: "none", ...extra,
    opacity: disabled ? 0.6 : 1,
  };

  const fillColor = variant === "gold" ? C.navy : variant === "outline" ? C.navy : C.gold;
  const styles = {
    primary: { background: C.navy, color: "#fff", boxShadow: showFill ? "0 8px 24px rgba(12,35,64,0.25)" : "0 1px 3px rgba(12,35,64,0.15)" },
    gold: { background: C.gold, color: "#fff", boxShadow: showFill ? "0 8px 24px rgba(176,141,87,0.35)" : "0 1px 3px rgba(176,141,87,0.2)" },
    outline: { background: "transparent", color: C.navy, border: `1.5px solid ${C.border}`, boxShadow: "none" },
    ghost: { background: "transparent", color: C.gold, border: `1.5px solid ${C.gold}22`, boxShadow: "none" },
  };

  return (
    <button
      type={type}
      ref={btnRef}
      style={{ ...base, ...styles[variant], color: showFill && variant !== "outline" ? "#fff" : styles[variant].color }}
      onPointerEnter={(e) => { if(disabled) return; const r = e.currentTarget.getBoundingClientRect(); updateOrigin(e.clientX - r.left, e.clientY - r.top); setHovered(true); }}
      onPointerLeave={() => { setHovered(false); setPressed(false); }}
      onPointerDown={(e) => { if(disabled || e.button !== 0) return; const r = e.currentTarget.getBoundingClientRect(); updateOrigin(e.clientX - r.left, e.clientY - r.top); setPressed(true); }}
      onPointerUp={() => setPressed(false)}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <span
        aria-hidden
        style={{
          position: "absolute", borderRadius: "50%", background: fillColor,
          width: coverSize, height: coverSize, left: origin.x, top: origin.y,
          transform: `translate(-50%, -50%) scale(${showFill && coverSize > 0 ? 1 : 0})`,
          transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
          opacity: variant === "outline" ? 0.08 : 0.15, pointerEvents: "none",
        }}
      />
      <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: 8 }}>
        {children}
      </span>
    </button>
  );
}

// ---------- Label ----------
export function Label({ children, required }) {
  return (
    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: C.text, marginBottom: 6, letterSpacing: "0.01em", fontFamily: fonts.body }}>
      {children}
      {required && <span style={{ color: C.gold, marginLeft: 3 }}>*</span>}
    </label>
  );
}

// ---------- Input ----------
export function Input({ label, required, error, hint, type = "text", ...props }) {
  const [focus, setFocus] = useState(false);
  const errColor = "#dc2626";
  return (
    <div style={{ marginBottom: 20 }}>
      {label && <Label required={required}>{label}</Label>}
      <input
        type={type}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          display: "block", width: "100%",
          padding: "11px 14px", fontSize: "0.9rem",
          fontFamily: fonts.body,
          background: C.white, color: C.text,
          border: `1.5px solid ${error ? errColor : focus ? C.gold : C.border}`,
          borderRadius: 9, outline: "none",
          transition: "border-color 0.18s, box-shadow 0.18s",
          boxShadow: focus ? `0 0 0 3px ${C.gold}18` : error ? `0 0 0 3px ${errColor}12` : "none",
        }}
        {...props}
      />
      {hint && !error && <p style={{ fontSize: "0.75rem", color: C.muted, marginTop: 5, fontFamily: fonts.body }}>{hint}</p>}
      {error && <p style={{ fontSize: "0.75rem", color: errColor, marginTop: 5, display: "flex", alignItems: "center", gap: 4, fontFamily: fonts.body }}>⚠ {error}</p>}
    </div>
  );
}

// ---------- Select ----------
export function Select({ label, required, error, children, ...props }) {
  const [focus, setFocus] = useState(false);
  const errColor = "#dc2626";
  return (
    <div style={{ marginBottom: 20 }}>
      {label && <Label required={required}>{label}</Label>}
      <select
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          display: "block", width: "100%",
          padding: "11px 14px", fontSize: "0.9rem",
          fontFamily: fonts.body,
          background: C.white, color: C.text,
          border: `1.5px solid ${error ? errColor : focus ? C.gold : C.border}`,
          borderRadius: 9, outline: "none", cursor: "pointer",
          transition: "border-color 0.18s, box-shadow 0.18s",
          boxShadow: focus ? `0 0 0 3px ${C.gold}18` : "none",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235F5E5A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
        }}
        {...props}
      >
        {children}
      </select>
      {error && <p style={{ fontSize: "0.75rem", color: errColor, marginTop: 5, fontFamily: fonts.body }}>⚠ {error}</p>}
    </div>
  );
}

// ---------- Textarea ----------
export function Textarea({ label, required, error, maxChars, value, onChange, ...props }) {
  const errColor = "#dc2626";
  return (
    <div style={{ marginBottom: 20 }}>
      {label && <Label required={required}>{label}</Label>}
      <div style={{ position: "relative" }}>
        <textarea
          value={value}
          onChange={onChange}
          style={{
            display: "block", width: "100%",
            padding: "11px 14px", fontSize: "0.9rem",
            fontFamily: fonts.body,
            background: C.white, color: C.text,
            border: `1.5px solid ${error ? errColor : C.border}`,
            borderRadius: 9, outline: "none", resize: "vertical",
            minHeight: 100, lineHeight: 1.6,
            transition: "border-color 0.18s",
          }}
          onFocus={e => e.target.style.borderColor = C.gold}
          onBlur={e => e.target.style.borderColor = error ? errColor : C.border}
          {...props}
        />
        {maxChars && (
          <span style={{ position: "absolute", bottom: 10, right: 12, fontSize: "0.72rem", color: value?.length > maxChars * 0.9 ? errColor : C.muted2, fontFamily: fonts.body }}>
            {value?.length || 0}/{maxChars}
          </span>
        )}
      </div>
      {error && <p style={{ fontSize: "0.75rem", color: errColor, marginTop: 5, fontFamily: fonts.body }}>⚠ {error}</p>}
    </div>
  );
}

// ---------- Card ----------
export function Card({ children, surface = "white", style = {} }) {
  return (
    <div
      style={{
        backgroundColor: surface === "cream" ? C.cream : C.white,
        border: `1px solid ${C.border}`,
        borderRadius: "16px",
        padding: "36px",
        fontFamily: fonts.body,
        boxShadow: "0 2px 12px rgba(12,35,64,0.06)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ---------- Badge ----------
export function Badge({ children, tone = "neutral", style = {} }) {
  const tones = {
    neutral: { backgroundColor: C.cream, color: C.navyMid, border: `1px solid ${C.border}` },
    gold: { backgroundColor: C.goldPale, color: "#7A5C25", border: `1px solid ${C.gold}44` },
    success: { backgroundColor: "#EAF3DE", color: "#3B6D11", border: "none" },
    navy: { backgroundColor: C.navy, color: "#fff", border: "none" },
  };
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: fonts.body,
        fontSize: "0.66rem",
        fontWeight: 600,
        borderRadius: "4px",
        padding: "3px 8px",
        ...tones[tone],
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ---------- Avatar ----------
export function Avatar({ initials, size = 40 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: C.navy,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fonts.body,
        fontWeight: 700,
        fontSize: size * 0.35,
        border: "2px solid #fff",
        boxShadow: "0 2px 8px rgba(12,35,64,0.1)",
      }}
    >
      {initials}
    </div>
  );
}

// ---------- Logo ----------
export function Logo({ variant = "primary", height = 40 }) {
  const wordmarkColor = variant === "reversed" ? C.white : C.navy;

  const Icon = (
    <img src="/logos/logo.png" alt="Origin" style={{ height: height || 40, objectFit: "contain" }} />
  );

  if (variant === "icon") return Icon;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
      {Icon}
    </div>
  );
}

// ---------- Text ----------
export function Text({ children, level = "body", color, style = {} }) {
  const isDisplay = level === "h1" || level === "h2" || level === "h3";
  const tag = level === "h1" ? "h1" : level === "h2" ? "h2" : level === "h3" ? "h3" : "p";
  const sizes = { h1: "2.5rem", h2: "1.8rem", h3: "1.2rem", body: "0.95rem", small: "0.82rem", caption: "0.75rem" };

  return React.createElement(
    tag,
    {
      style: {
        margin: 0,
        fontFamily: isDisplay ? fonts.display : fonts.body,
        fontSize: sizes[level] || sizes.body,
        fontWeight: isDisplay ? 700 : 400,
        lineHeight: isDisplay ? 1.2 : 1.6,
        letterSpacing: isDisplay ? "-0.02em" : "0",
        color: color || (isDisplay ? C.navy : C.muted),
        ...style,
      },
    },
    children
  );
}