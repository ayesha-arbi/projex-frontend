// tokens.js
// Single source of truth for Projex's design values.

export const colors = {
  navy:          "#0C2340",
  navyMid:       "#1a3a5c",
  navyLight:     "#2a5080",
  gold:          "#B08D57",
  goldLight:     "#C9A97A",
  goldPale:      "#F0E6D3",
  cream:         "#F4F1EC",
  creamDark:     "#EBE6DE",
  white:         "#FFFFFF",
  border:        "#E5E2DA",
  text:          "#0C2340",
  muted:         "#5F5E5A",
  muted2:        "#8A8880",
  disabledBorder:"#B4B2A9",
  disabledText:  "#B4B2A9",
};

// C is an alias for colors — import either name, they're the same object
export const C = colors;

export const fonts = {
  display: "'Sora', -apple-system, BlinkMacSystemFont, sans-serif",
  body:    "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

export const fontSizes = {
  h1:      "48px",
  h2:      "32px",
  h3:      "22px",
  body:    "16px",
  small:   "13px",
  caption: "11px",
};

export const fontWeights = {
  regular:  400,
  medium:   500,
  semibold: 600,
};

export const radius = {
  button: "50px",
  card:   "16px",
  badge:  "6px",
  input:  "10px",
};

export const spacing = {
  xs:  "4px",
  sm:  "8px",
  md:  "16px",
  lg:  "24px",
  xl:  "40px",
  xxl: "64px",
};

export const shadows = {
  none: "none",
};

export const buttonPadding = {
  default: "14px 32px",
  small:   "10px 22px",
};