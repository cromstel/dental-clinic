export const easeOutExpo = [0.22, 1, 0.36, 1] as const;

export const springGentle = { stiffness: 220, damping: 18, mass: 0.4 };

export const springCursorOuter = { stiffness: 500, damping: 40, mass: 0.5 };

export const springCursorInner = { stiffness: 300, damping: 30, mass: 0.5 };

export const springSmileTransform = { stiffness: 260, damping: 30 };

export const springExperience = { stiffness: 120, damping: 18 };

export const springMagnetic = { stiffness: 220, damping: 18, mass: 0.4 };

export const transitionDuration = {
  fast: 0.3,
  normal: 0.4,
  slow: 0.55,
  verySlow: 0.7,
} as const;

export const staggerDelay = {
  tight: 0.03,
  normal: 0.045,
  loose: 0.06,
  veryLoose: 0.07,
} as const;