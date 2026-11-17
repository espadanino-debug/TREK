import type { Metadata } from "next";
import { Suspense } from "react";
import { limits } from "@/config/site";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: true },
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-center text-3xl font-extrabold">Sign in</h1>
      <p className="mt-2 text-center text-muted">
        New here? Signing up is free and gives you {limits.signupCredits} coloring page credits.
      </p>
      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <Suspense fallback={<div className="h-56" />}>
          <LoginForm />
        </Suspense>
      </div>
    </section>
  );
}
