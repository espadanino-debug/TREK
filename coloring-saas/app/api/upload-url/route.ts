import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { limits } from "@/config/site";
import { apiError, handleApiError } from "@/lib/api";
import { getActor, getQuota } from "@/lib/quota";
import { BUCKETS, createAdminClient } from "@/lib/supabase/admin";
import { noQuotaError } from "@/lib/generation";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/heic": "heic",
  "image/heif": "heif",
};

// Returns a one-time signed URL so the browser uploads the photo straight to
// Supabase Storage (Vercel functions can't receive bodies larger than 4.5 MB).
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      contentType?: string;
      size?: number;
    } | null;
    const contentType = body?.contentType ?? "";
    const size = Number(body?.size ?? 0);

    if (!EXT_BY_TYPE[contentType]) {
      return apiError("bad_type", "Please upload a JPG, PNG or HEIC photo.");
    }
    if (!size || size > limits.maxUploadBytes) {
      return apiError("too_large", "That photo is too big. Please use a photo under 10 MB.");
    }

    const actor = await getActor();
    const quota = await getQuota(actor);
    const err = noQuotaError(quota);
    if (err) return apiError(err.code, err.message, err.status);

    const db = createAdminClient();
    const since = new Date(Date.now() - 3600_000).toISOString();
    const recent = db.from("uploads").select("path", { count: "exact", head: true }).gt("created_at", since);
    const { count } =
      actor.kind === "user" ? await recent.eq("user_id", actor.user.id) : await recent.eq("anon_id", actor.anonId);
    if ((count ?? 0) >= limits.maxUploadsPerHour) {
      return apiError("rate_limited", "Too many uploads. Please wait a little and try again.", 429);
    }

    const owner = actor.kind === "user" ? `users/${actor.user.id}` : `anon/${actor.anonId}`;
    const path = `${owner}/${randomUUID()}.${EXT_BY_TYPE[contentType]}`;

    const { data, error } = await db.storage.from(BUCKETS.uploads).createSignedUploadUrl(path);
    if (error || !data) throw new Error(`createSignedUploadUrl failed: ${error?.message}`);

    const { error: insertError } = await db.from("uploads").insert({
      path,
      user_id: actor.kind === "user" ? actor.user.id : null,
      anon_id: actor.anonId,
    });
    if (insertError) throw new Error(`uploads insert failed: ${insertError.message}`);

    return NextResponse.json({ path: data.path, token: data.token });
  } catch (err) {
    return handleApiError(err, "upload-url");
  }
}
