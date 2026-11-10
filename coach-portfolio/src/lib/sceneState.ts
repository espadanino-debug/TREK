/**
 * Mutable pose shared between GSAP (which writes it from scroll) and the
 * React Three Fiber scene (which reads it every frame). Keeping it outside
 * React avoids re-rendering the canvas on scroll.
 */
export const pose = {
  x: 0,
  y: 0,
  z: 0,
  rx: 0.25,
  rz: 0.45,
  scale: 1,
  opacity: 1,
  /** 0 → 1 entrance factor, played once when the preloader lifts */
  intro: 0,
  /** extra spin added from scroll velocity, decays every frame */
  boost: 0,
};

export type Pose = typeof pose;
