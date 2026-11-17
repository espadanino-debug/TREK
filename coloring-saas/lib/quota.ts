import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { limits } from "@/config/site";
import { optionalEnv, requireEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server";

const ANON_COOKIE = "cp_anon";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type Actor =
  | { kind: "user"; user: User; anonId: string | null }
  | { kind: "anon"; anonId: string; ipHash: string };

/** Reads the visitor's anonymous id cookie, creating it if `create` is true. */
async function getAnonId(create: boolean): Promise<string | null> {
  const store = await cookies();
  const existing = store.get(ANON_COOKIE)?.value;
  if (existing && UUID_RE.test(existing)) return existing;
  if (!create) return null;
  const id = randomUUID();
  store.set(ANON_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}

async function getIpHash(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  // Salted hash: we never store raw IP addresses.
  const salt = optionalEnv("IP_HASH_SALT") ?? requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/** Who is making this request: a signed-in user, or an anonymous visitor (cookie + IP). */
export async function getActor(): Promise<Actor> {
  const user = await getCurrentUser();
  if (user) return { kind: "user", user, anonId: await getAnonId(false) };
  return { kind: "anon", anonId: (await getAnonId(true))!, ipHash: await getIpHash() };
}

export type QuotaState =
  | { signedIn: true; email: string | null; credits: number }
  | { signedIn: false; freeLeft: number };

export async function getQuota(actor: Actor): Promise<QuotaState> {
  const db = createAdminClient();
  if (actor.kind === "user") {
    const { data } = await db
      .from("profiles")
      .select("credits")
      .eq("id", actor.user.id)
      .maybeSingle();
    return { signedIn: true, email: actor.user.email ?? null, credits: data?.credits ?? 0 };
  }

  const since = new Date(Date.now() - limits.anonIpWindowHours * 3600_000).toISOString();
  const [byCookie, byIp] = await Promise.all([
    db.from("anon_usage").select("id", { count: "exact", head: true }).eq("anon_id", actor.anonId),
    db
      .from("anon_usage")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", actor.ipHash)
      .gt("created_at", since),
  ]);
  const used = (byCookie.count ?? 0) > 0 || (byIp.count ?? 0) > 0;
  return { signedIn: false, freeLeft: used ? 0 : 1 };
}

export type Reservation =
  | { kind: "credit"; userId: string; creditsLeft: number }
  | { kind: "anon"; claimId: number };

/** Takes one credit (or the free anonymous generation). Returns null if none is left. */
export async function reserveGeneration(actor: Actor): Promise<Reservation | null> {
  const db = createAdminClient();
  if (actor.kind === "user") {
    const { data, error } = await db.rpc("consume_credit", { p_user_id: actor.user.id });
    if (error) throw new Error(`consume_credit failed: ${error.message}`);
    const left = data as number;
    if (left < 0) return null;
    return { kind: "credit", userId: actor.user.id, creditsLeft: left };
  }
  const { data, error } = await db.rpc("claim_anon_generation", {
    p_ip_hash: actor.ipHash,
    p_anon_id: actor.anonId,
    p_window_hours: limits.anonIpWindowHours,
  });
  if (error) throw new Error(`claim_anon_generation failed: ${error.message}`);
  if (data === null || data === undefined) return null;
  return { kind: "anon", claimId: Number(data) };
}

/** Gives the credit back when a generation fails. */
export async function releaseGeneration(reservation: Reservation): Promise<void> {
  const db = createAdminClient();
  if (reservation.kind === "credit") {
    const { error } = await db.rpc("refund_credit", { p_user_id: reservation.userId });
    if (error) console.error("[quota] refund_credit failed:", error.message);
  } else {
    const { error } = await db.from("anon_usage").delete().eq("id", reservation.claimId);
    if (error) console.error("[quota] releasing anon claim failed:", error.message);
  }
}

/** True if this actor may access a generation row. */
export function ownsGeneration(
  actor: Actor,
  row: { user_id: string | null; anon_id: string | null },
): boolean {
  if (actor.kind === "user") {
    return row.user_id === actor.user.id || (!row.user_id && !!actor.anonId && row.anon_id === actor.anonId);
  }
  return !row.user_id && row.anon_id === actor.anonId;
}
