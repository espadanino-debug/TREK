import "server-only";

import { UserFacingError } from "@/lib/errors";
import type {
  ColoringPageProvider,
  GenerateColoringPageInput,
  GenerateColoringPageResult,
} from "./provider";
import { photoPrompt, textPrompt } from "./prompts";

const API = "https://api.openai.com/v1";
const TIMEOUT_MS = 150_000;

const SIZES = {
  portrait: "1024x1536",
  landscape: "1536x1024",
  square: "1024x1024",
} as const;

type OpenAIImageResponse = {
  data?: { b64_json?: string }[];
  error?: { code?: string; message?: string; type?: string };
};

export function createOpenAIProvider(apiKey: string): ColoringPageProvider {
  const model = process.env.AI_MODEL || "gpt-image-1";
  const quality = process.env.AI_IMAGE_QUALITY || "medium"; // low | medium | high

  async function call(path: string, init: RequestInit): Promise<Buffer> {
    let res: Response;
    try {
      res = await fetch(`${API}${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${apiKey}`, ...(init.headers ?? {}) },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (err) {
      throw new Error(`OpenAI request failed: ${(err as Error).name}`);
    }

    const body = (await res.json().catch(() => ({}))) as OpenAIImageResponse;

    if (!res.ok) {
      const code = body.error?.code ?? "";
      if (code === "moderation_blocked" || code === "content_policy_violation") {
        throw new UserFacingError(
          "rejected_content",
          "We couldn't make a coloring page from this one because it may break our content rules. Please try a different photo or idea.",
          422,
        );
      }
      // Never log request bodies (they contain the user's photo or prompt).
      throw new Error(`OpenAI error ${res.status}: ${code || body.error?.type || "unknown"}`);
    }

    const b64 = body.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI returned no image");
    return Buffer.from(b64, "base64");
  }

  return {
    name: "openai",
    async generateColoringPage(
      input: GenerateColoringPageInput,
    ): Promise<GenerateColoringPageResult> {
      const size = SIZES[input.orientation ?? "portrait"];

      if (input.imageUrl) {
        const photo = await fetch(input.imageUrl, { signal: AbortSignal.timeout(30_000) });
        if (!photo.ok) throw new Error(`Could not fetch input image (${photo.status})`);
        const blob = new Blob([await photo.arrayBuffer()], { type: "image/jpeg" });

        const form = new FormData();
        form.append("model", model);
        form.append("image", blob, "photo.jpg");
        form.append("prompt", photoPrompt(input.style));
        form.append("size", size);
        form.append("quality", quality);
        form.append("output_format", "png");
        form.append("n", "1");

        const image = await call("/images/edits", { method: "POST", body: form });
        return { image, mimeType: "image/png" };
      }

      const image = await call("/images/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: textPrompt(input.prompt!, input.style),
          size,
          quality,
          output_format: "png",
          background: "opaque",
          n: 1,
        }),
      });
      return { image, mimeType: "image/png" };
    },
  };
}
