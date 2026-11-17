import "server-only";

import { type ColoringStyle } from "@/config/site";
import { generateColoringPage } from "@/lib/ai/provider";
import { UserFacingError } from "@/lib/errors";
import { finalizeColoringPage, normalizePhoto } from "@/lib/image/process";
import { checkImage, checkPrompt } from "@/lib/moderation";
import {
  releaseGeneration,
  reserveGeneration,
  type Actor,
  type QuotaState,
} from "@/lib/quota";
import { BUCKETS, createAdminClient } from "@/lib/supabase/admin";

export function noQuotaError(quota: QuotaState): UserFacingError | null {
  if (quota.signedIn && quota.credits <= 0) {
    return new UserFacingError(
      "no_credits",
      "You've used all your credits. More credit packs are coming soon!",
      402,
    );
  }
  if (!quota.signedIn && quota.freeLeft <= 0) {
    return new UserFacingError(
      "sign_in_required",
      "You've used your free coloring page. Sign in (it's free) to get 3 more credits.",
      403,
    );
  }
  return null;
}

export type GenerateRequest =
  | { inputType: "photo"; uploadPath: string; style: ColoringStyle }
  | { inputType: "prompt"; prompt: string; style: ColoringStyle };

export type GenerateResult = {
  id: string;
  previewUrl: string;
  watermarked: boolean;
  creditsLeft: number | null;
};

const SIGNED_URL_SECONDS = 60 * 60;

async function deleteUploads(paths: string[]) {
  if (paths.length === 0) return;
  const db = createAdminClient();
  const { error } = await db.storage.from(BUCKETS.uploads).remove(paths);
  if (error) {
    console.error("[generate] deleting upload failed:", error.message);
    return; // the cleanup job will retry from the uploads table
  }
  await db.from("uploads").delete().in("path", paths);
}

/** Checks the upload exists, belongs to this actor and is recent. */
async function assertUploadOwner(actor: Actor, path: string) {
  const db = createAdminClient();
  const { data } = await db
    .from("uploads")
    .select("path, user_id, anon_id")
    .eq("path", path)
    .maybeSingle();
  const owned =
    data &&
    (actor.kind === "user" ? data.user_id === actor.user.id : data.anon_id === actor.anonId);
  if (!owned) {
    throw new UserFacingError("upload_missing", "We couldn't find your photo. Please upload it again.");
  }
}

export async function runGeneration(actor: Actor, req: GenerateRequest): Promise<GenerateResult> {
  const db = createAdminClient();

  // 1. Validate input before taking a credit.
  let prompt: string | null = null;
  if (req.inputType === "prompt") {
    prompt = await checkPrompt(req.prompt);
  } else {
    await assertUploadOwner(actor, req.uploadPath);
  }

  // 2. Take a credit (or the free anonymous page).
  const reservation = await reserveGeneration(actor);
  if (!reservation) {
    const err = noQuotaError(
      actor.kind === "user" ? { signedIn: true, email: null, credits: 0 } : { signedIn: false, freeLeft: 0 },
    );
    throw err!;
  }

  // Phase 1: every output is watermarked (paid credits remove it in Phase 2).
  const watermarked = true;

  const { data: row, error: insertError } = await db
    .from("generations")
    .insert({
      user_id: actor.kind === "user" ? actor.user.id : null,
      anon_id: actor.anonId,
      input_type: req.inputType,
      input_url: req.inputType === "photo" ? req.uploadPath : null,
      prompt,
      style: req.style,
      status: "pending",
      watermarked,
    })
    .select("id")
    .single();

  if (insertError || !row) {
    await releaseGeneration(reservation);
    throw new Error(`generations insert failed: ${insertError?.message}`);
  }

  const id = row.id as string;
  const uploadsToDelete: string[] = [];

  try {
    // 3. Make the coloring page.
    let aiImage: Buffer;
    if (req.inputType === "photo") {
      uploadsToDelete.push(req.uploadPath);
      const { data: file, error } = await db.storage.from(BUCKETS.uploads).download(req.uploadPath);
      if (error || !file) {
        throw new UserFacingError("upload_missing", "We couldn't find your photo. Please upload it again.");
      }
      const photo = await normalizePhoto(Buffer.from(await file.arrayBuffer()));
      await checkImage(photo.thumb);

      // The adapter takes a URL, so store the cleaned JPEG and pass a short-lived link.
      const normalizedPath = `${req.uploadPath}.normalized.jpg`;
      const { error: upError } = await db.storage
        .from(BUCKETS.uploads)
        .upload(normalizedPath, photo.jpeg, { contentType: "image/jpeg", upsert: true });
      if (upError) throw new Error(`normalized upload failed: ${upError.message}`);
      await db.from("uploads").insert({
        path: normalizedPath,
        user_id: actor.kind === "user" ? actor.user.id : null,
        anon_id: actor.anonId,
      });
      uploadsToDelete.push(normalizedPath);

      const { data: signed, error: signError } = await db.storage
        .from(BUCKETS.uploads)
        .createSignedUrl(normalizedPath, 600);
      if (signError || !signed) throw new Error(`sign normalized failed: ${signError?.message}`);

      ({ image: aiImage } = await generateColoringPage({
        imageUrl: signed.signedUrl,
        style: req.style,
        orientation: photo.orientation,
      }));
    } else {
      ({ image: aiImage } = await generateColoringPage({ prompt: prompt!, style: req.style }));
    }

    // 4. Clean up the image, watermark it and store it.
    const { png } = await finalizeColoringPage(aiImage, { watermark: watermarked });
    const outputPath = `${id}.png`;
    const { error: outError } = await db.storage
      .from(BUCKETS.outputs)
      .upload(outputPath, png, { contentType: "image/png", upsert: true });
    if (outError) throw new Error(`output upload failed: ${outError.message}`);

    await db
      .from("generations")
      .update({ status: "succeeded", output_url: outputPath, input_url: null })
      .eq("id", id);

    const { data: preview, error: previewError } = await db.storage
      .from(BUCKETS.outputs)
      .createSignedUrl(outputPath, SIGNED_URL_SECONDS);
    if (previewError || !preview) throw new Error(`sign output failed: ${previewError?.message}`);

    return {
      id,
      previewUrl: preview.signedUrl,
      watermarked,
      creditsLeft: reservation.kind === "credit" ? reservation.creditsLeft : null,
    };
  } catch (err) {
    const rejected = err instanceof UserFacingError && err.code === "rejected_content";
    await db
      .from("generations")
      .update({
        status: rejected ? "rejected" : "failed",
        input_url: null,
        error: err instanceof Error ? err.message.slice(0, 300) : "unknown",
      })
      .eq("id", id);
    await releaseGeneration(reservation);
    throw err;
  } finally {
    // Photos are deleted as soon as we're done with them, success or not.
    await deleteUploads(uploadsToDelete);
  }
}

/** Short-lived signed URL for a stored output. */
export async function signedOutputUrl(path: string, seconds = SIGNED_URL_SECONDS) {
  const db = createAdminClient();
  const { data } = await db.storage.from(BUCKETS.outputs).createSignedUrl(path, seconds);
  return data?.signedUrl ?? null;
}
