// Easing curves and duration tokens for Framer Motion animation consistency
export const ease = {
  standard: [0.22, 1, 0.36, 1],   // reveals, hovers (soft ease-out)
  sharp: [0.4, 0, 0.2, 1],         // fast UI feedback (button press, toggle)
} as const;

export const duration = {
  fast: 0.15,
  base: 0.5,
  slow: 0.7,
} as const;

export const stagger = {
  tight: 0.06,
  base: 0.08,
} as const;
