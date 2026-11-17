"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { safeNextPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const linkError = params.get("error") === "link";

  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(
    linkError ? "That sign-in link didn't work or has expired. Please request a new one." : null,
  );

  // Built on click: window doesn't exist while the page is prerendered.
  const callbackUrl = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState("sending");
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callbackUrl() },
    });
    if (error) {
      setState("idle");
      setError(
        error.status === 429
          ? "Too many tries. Please wait a minute and try again."
          : "We couldn't send the email. Please check the address and try again.",
      );
      return;
    }
    setState("sent");
  }

  async function signInWithGoogle() {
    setError(null);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
    if (error) setError("Google sign-in isn't available right now. Please use your email.");
  }

  if (state === "sent") {
    return (
      <div className="text-center" role="status">
        <p className="text-4xl">📬</p>
        <h2 className="mt-2 text-xl font-extrabold">Check your email</h2>
        <p className="mt-2 text-muted">
          We sent a sign-in link to <strong>{email}</strong>. Open it on this device to finish
          signing in.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-4 text-sm font-bold text-primary underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={signInWithGoogle}
        className="flex items-center justify-center gap-3 rounded-2xl border-2 border-border px-4 py-3 font-bold hover:bg-background"
      >
        <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 text-xs font-semibold text-muted">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={sendMagicLink} className="flex flex-col gap-3">
        <label htmlFor="email" className="text-sm font-bold">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded-2xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-2xl bg-primary px-4 py-3 font-extrabold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Email me a sign-in link"}
        </button>
        <p className="text-center text-xs text-muted">No password needed.</p>
      </form>

      {error && (
        <p role="alert" className="rounded-2xl bg-coral/10 p-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
