/** Shared motion tokens so every animation on the site moves with the same character. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_SOFT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DURATION = {
  quick: 0.5,
  base: 0.9,
  slow: 1.3,
} as const;

/** Trigger point shared by scroll reveals: a little way into the viewport. */
export const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;
