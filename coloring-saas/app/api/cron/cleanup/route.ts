import { NextResponse, type NextRequest } from "next/server";
import { limits } from "@/config/site";
import { handleApiError } from "@/lib/api";
import { requireEnv } from "@/lib/env";
import { BUCKETS, createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60;

const BATCH = 100;

// Deletes leftover uploaded photos and old anonymous outputs.
// Called by Vercel Cron (daily) and, ideally, by Supabase pg_cron every hour (see README).
// Requires header: Authorization: Bearer <CRON_SECRET>
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  try {
    if (auth !== `Bearer ${requireEnv("CRON_SECRET")}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const db = createAdminClient();
    const now = Date.now();
    let deletedUploads = 0;
    let deletedOutputs = 0;

    // 1. Uploaded photos older than uploadMaxAgeMinutes (normally already gone).
    const uploadCutoff = new Date(now - limits.uploadMaxAgeMinutes * 60_000).toISOString();
    for (;;) {
      const { data: rows, error } = await db
        .from("uploads")
        .select("path")
        .lt("created_at", uploadCutoff)
        .limit(BATCH);
      if (error) throw new Error(`select uploads failed: ${error.message}`);
      if (!rows?.length) break;

      const paths = rows.map((r) => r.path as string);
      const { error: rmError } = await db.storage.from(BUCKETS.uploads).remove(paths);
      if (rmError) throw new Error(`remove uploads failed: ${rmError.message}`);
      await db.from("uploads").delete().in("path", paths);
      await db.from("generations").update({ input_url: null }).in("input_url", paths);
      deletedUploads += paths.length;
      if (rows.length < BATCH) break;
    }

    // 2. Coloring pages made by visitors who never signed in.
    const outputCutoff = new Date(now - limits.anonOutputRetentionDays * 86_400_000).toISOString();
    for (;;) {
      const { data: rows, error } = await db
        .from("generations")
        .select("id, output_url")
        .is("user_id", null)
        .not("output_url", "is", null)
        .lt("created_at", outputCutoff)
        .limit(BATCH);
      if (error) throw new Error(`select outputs failed: ${error.message}`);
      if (!rows?.length) break;

      const { error: rmError } = await db.storage
        .from(BUCKETS.outputs)
        .remove(rows.map((r) => r.output_url as string));
      if (rmError) throw new Error(`remove outputs failed: ${rmError.message}`);
      await db
        .from("generations")
        .update({ output_url: null })
        .in("id", rows.map((r) => r.id as string));
      deletedOutputs += rows.length;
      if (rows.length < BATCH) break;
    }

    // 3. Old anonymous usage records (salted IP hashes) after 90 days.
    await db
      .from("anon_usage")
      .delete()
      .lt("created_at", new Date(now - 90 * 86_400_000).toISOString());

    return NextResponse.json({ ok: true, deletedUploads, deletedOutputs });
  } catch (err) {
    return handleApiError(err, "cron-cleanup");
  }
}
