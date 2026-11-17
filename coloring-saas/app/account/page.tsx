import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BUCKETS, createAdminClient } from "@/lib/supabase/admin";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

// This page always depends on the signed-in user.
export const instant = false;

export default function AccountPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">My account</h1>
      <Suspense fallback={<p className="mt-6 text-muted">Loading your coloring pages…</p>}>
        <AccountContent />
      </Suspense>
    </section>
  );
}

type GenerationRow = {
  id: string;
  input_type: "photo" | "prompt";
  prompt: string | null;
  output_url: string | null;
  style: string;
  created_at: string;
};

async function AccountContent() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  // Reads go through the user's own session, so Row Level Security applies.
  const supabase = await createClient();
  const [{ data: profile }, { data: generations }] = await Promise.all([
    supabase.from("profiles").select("credits").eq("id", user.id).maybeSingle(),
    supabase
      .from("generations")
      .select("id, input_type, prompt, output_url, style, created_at")
      .eq("status", "succeeded")
      .order("created_at", { ascending: false })
      .limit(60),
  ]);

  const rows = (generations ?? []) as GenerationRow[];
  const paths = rows.map((r) => r.output_url).filter((p): p is string => !!p);
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data } = await createAdminClient()
      .storage.from(BUCKETS.outputs)
      .createSignedUrls(paths, 60 * 60);
    data?.forEach((d) => d.path && d.signedUrl && signed.set(d.path, d.signedUrl));
  }

  return (
    <>
      <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">Signed in as {user.email}</p>
          <p className="mt-1 text-2xl font-extrabold">
            {profile?.credits ?? 0} credit{profile?.credits === 1 ? "" : "s"} left
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="rounded-2xl bg-primary px-4 py-3 font-bold text-white hover:bg-primary-hover"
          >
            Make a coloring page
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-2xl border-2 border-border px-4 py-3 font-bold hover:bg-background"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <h2 className="mt-10 mb-4 text-xl font-extrabold">My coloring pages</h2>
      {rows.length === 0 ? (
        <p className="text-muted">
          Nothing here yet.{" "}
          <Link href="/" className="font-bold text-primary underline">
            Make your first coloring page
          </Link>
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((row) => {
            const src = row.output_url ? signed.get(row.output_url) : undefined;
            const base = `/api/generations/${row.id}/download`;
            return (
              <li key={row.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex aspect-[3/4] items-center justify-center bg-white">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
                    <img
                      src={src}
                      alt={row.prompt ? `Coloring page: ${row.prompt}` : "Coloring page from a photo"}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-sm text-muted">Expired</span>
                  )}
                </div>
                <div className="p-3 text-xs">
                  <p className="truncate font-semibold">
                    {row.prompt ?? "From a photo"} · {row.style}
                  </p>
                  <p className="text-muted">{new Date(row.created_at).toLocaleDateString("en-US")}</p>
                  {src && (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-bold text-primary">
                      <a href={`${base}?format=pdf&size=letter`}>PDF Letter</a>
                      <a href={`${base}?format=pdf&size=a4`}>A4</a>
                      <a href={`${base}?format=png`}>PNG</a>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
