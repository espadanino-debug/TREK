import { NextResponse, type NextRequest } from "next/server";
import { isColoringStyle } from "@/config/site";
import { apiError, handleApiError } from "@/lib/api";
import { runGeneration, type GenerateRequest } from "@/lib/generation";
import { findBlockedTerm } from "@/lib/moderation/blocklist";
import { TRADEMARK_MESSAGE } from "@/lib/moderation";
import { getActor } from "@/lib/quota";

// Image generation can take up to a minute or two.
export const maxDuration = 180;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || !isColoringStyle(body.style)) {
      return apiError("bad_request", "Please pick a style and try again.");
    }

    let req: GenerateRequest;
    if (body.inputType === "photo" && typeof body.uploadPath === "string") {
      req = { inputType: "photo", uploadPath: body.uploadPath, style: body.style };
    } else if (body.inputType === "prompt" && typeof body.prompt === "string") {
      req = { inputType: "prompt", prompt: body.prompt, style: body.style };
    } else {
      return apiError("bad_request", "Please add a photo or describe your idea.");
    }

    // Cheap check first, before touching the database or the AI provider.
    if (req.inputType === "prompt" && findBlockedTerm(req.prompt)) {
      return apiError("trademark", TRADEMARK_MESSAGE, 422);
    }

    const actor = await getActor();
    const result = await runGeneration(actor, req);
    return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    return handleApiError(err, "generate");
  }
}
