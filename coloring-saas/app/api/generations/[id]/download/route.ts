import { type NextRequest } from "next/server";
import { apiError, handleApiError } from "@/lib/api";
import { buildColoringPdf, type PaperSize } from "@/lib/pdf";
import { getActor, ownsGeneration } from "@/lib/quota";
import { BUCKETS, createAdminClient } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/generations/:id/download?format=png|pdf&size=letter|a4
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/generations/[id]/download">,
) {
  try {
    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return apiError("not_found", "Coloring page not found.", 404);

    const params = request.nextUrl.searchParams;
    const format = params.get("format") === "pdf" ? "pdf" : "png";
    const paper: PaperSize = params.get("size") === "a4" ? "a4" : "letter";

    const actor = await getActor();
    const db = createAdminClient();
    const { data: row } = await db
      .from("generations")
      .select("id, user_id, anon_id, output_url, watermarked, status")
      .eq("id", id)
      .maybeSingle();

    if (!row || row.status !== "succeeded" || !row.output_url || !ownsGeneration(actor, row)) {
      return apiError("not_found", "Coloring page not found.", 404);
    }

    const { data: file, error } = await db.storage.from(BUCKETS.outputs).download(row.output_url);
    if (error || !file) return apiError("not_found", "This coloring page has expired.", 404);
    const png = Buffer.from(await file.arrayBuffer());

    const baseName = `coloring-page-${id.slice(0, 8)}`;
    const headers = { "Cache-Control": "private, no-store" };

    if (format === "png") {
      return new Response(new Uint8Array(png), {
        headers: {
          ...headers,
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${baseName}.png"`,
        },
      });
    }

    const pdf = await buildColoringPdf(png, {
      paper,
      watermark: row.watermarked,
      title: "Coloring page",
    });
    return new Response(new Uint8Array(pdf), {
      headers: {
        ...headers,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}-${paper}.pdf"`,
      },
    });
  } catch (err) {
    return handleApiError(err, "download");
  }
}
