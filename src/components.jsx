// components.jsx
// Every reusable UI piece for Projex lives here, built only from tokens.js values.
// Pages import what they need: import { Button, Card } from "./components";
// Do NOT redefine colors/radius/fonts inline in a page — add a new component
// or a new variant here instead, so every page stays visually consistent.

import React from "react";
import { colors, fonts, fontSizes, fontWeights, radius, spacing, buttonPadding } from "./assets/tokens";

// ---------- Button ----------
// variant: "primary" | "secondary" | "disabled"
// size: "default" | "small"
export function Button({ children, variant = "primary", size = "default", onClick, type = "button" }) {
  const base = {
    fontFamily: fonts.body,
    fontWeight: fontWeights.medium,
    fontSize: fontSizes.body,
    borderRadius: radius.button,
    padding: size === "small" ? buttonPadding.small : buttonPadding.default,
    border: "none",
    cursor: variant === "disabled" ? "not-allowed" : "pointer",
    transition: "background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  };

  const variants = {
    primary: {
      backgroundColor: colors.navy,
      color: colors.white,
    },
    secondary: {
      backgroundColor: "transparent",
      color: colors.gold,
      border: `1.5px solid ${colors.gold}`,
    },
    disabled: {
      backgroundColor: "transparent",
      color: colors.disabledText,
      border: `1.5px solid ${colors.disabledBorder}`,
    },
  };

  const [hover, setHover] = React.useState(false);

  const hoverStyle =
    variant === "primary" && hover ? { backgroundColor: colors.gold } : {};

  return (
    <button
      type={type}
      onClick={variant === "disabled" ? undefined : onClick}
      disabled={variant === "disabled"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variants[variant], ...hoverStyle }}
    >
      {children}
    </button>
  );
}

// ---------- Card ----------
// surface: "white" | "cream"
export function Card({ children, surface = "white", style = {} }) {
  return (
    <div
      style={{
        backgroundColor: surface === "cream" ? colors.cream : colors.white,
        border: `0.5px solid ${colors.border}`,
        borderRadius: radius.card,
        padding: spacing.lg,
        fontFamily: fonts.body,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ---------- Badge ----------
// Small pill/tag used inside cards, e.g. "FYP", "Verified"
export function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: { backgroundColor: colors.cream, color: colors.navy },
    gold: { backgroundColor: colors.gold, color: colors.white },
  };
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: fonts.body,
        fontSize: fontSizes.caption,
        fontWeight: fontWeights.medium,
        borderRadius: radius.badge,
        padding: "4px 10px",
        letterSpacing: "0.3px",
        ...tones[tone],
      }}
    >
      {children}
    </span>
  );
}

// ---------- Avatar ----------
// Circular initials avatar, used on company profile cards etc.
export function Avatar({ initials, size = 40 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: colors.navy,
        color: colors.gold,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fonts.body,
        fontWeight: fontWeights.medium,
        fontSize: size * 0.32,
      }}
    >
      {initials}
    </div>
  );
}

// ---------- Headline / Text ----------
// level: "h1" | "h2" | "h3" | "body" | "small" | "caption"
export function Text({ children, level = "body", color, style = {} }) {
  const isDisplay = level === "h1" || level === "h2";
  const tag = level === "h1" ? "h1" : level === "h2" ? "h2" : level === "h3" ? "h3" : "p";

  return React.createElement(
    tag,
    {
      style: {
        margin: 0,
        fontFamily: isDisplay ? fonts.display : fonts.body,
        fontSize: fontSizes[level] || fontSizes.body,
        fontWeight: isDisplay ? fontWeights.medium : fontWeights.regular,
        color: color || colors.navy,
        ...style,
      },
    },
    children
  );
}

// ---------- Logo ----------
// variant: "primary" (icon + wordmark) | "icon" (mark only) | "reversed" (on navy)
export function Logo({ variant = "primary", height = 40 }) {
  const wordmarkColor = variant === "reversed" ? colors.white : colors.navy;

  const Icon = (
    <svg width={height * 0.9} height={height * 0.6} viewBox="0 0 60 40" style={{ display: "block" }}>
      <path d="M 0 4 A 18 18 0 0 1 18 22 A 18 18 0 0 1 0 40 Z" fill={colors.gold} />
      <path d="M 20 4 A 18 18 0 0 1 38 22 A 18 18 0 0 1 20 40 Z" fill={colors.gold} />
    </svg>
  );

  if (variant === "icon") return Icon;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing.xs }}>
      {Icon}
      <span
        style={{
          fontFamily: fonts.display,
          fontSize: height * 0.7,
          fontWeight: fontWeights.medium,
          color: wordmarkColor,
        }}
      >
        projex
      </span>
    </div>
  );
}