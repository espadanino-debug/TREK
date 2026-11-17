"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

// Supabase keeps the session in a "sb-<project>-auth-token" cookie. Checking for it is
// enough to pick the label; the account page verifies the session on the server.
function hasSessionCookie() {
  return /(?:^|;\s*)sb-[^=]+-auth-token(?:\.0)?=/.test(document.cookie);
}

const subscribe = () => () => {};

export function AuthLink() {
  const signedIn = useSyncExternalStore(subscribe, hasSessionCookie, () => false);
  return (
    <Link
      href={signedIn ? "/account" : "/login"}
      className="rounded-full bg-primary px-4 py-2 text-white hover:bg-primary-hover"
    >
      {signedIn ? "My account" : "Sign in"}
    </Link>
  );
}
