"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny global flag: flips to true once the preloader starts its wipe.
 * Sections that should not animate behind the preloader (hero intro,
 * smooth scroll) subscribe to it.
 */
let ready = false;
const listeners = new Set<() => void>();

export function setReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((l) => l());
}

export function isReady() {
  return ready;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useReady() {
  return useSyncExternalStore(subscribe, () => ready, () => false);
}
