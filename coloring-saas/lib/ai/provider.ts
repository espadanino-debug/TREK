import "server-only";

import type { ColoringStyle } from "@/config/site";
import { requireEnv } from "@/lib/env";
import { createOpenAIProvider } from "./openai";

export type GenerateColoringPageInput = {
  /** Short-lived URL of the (already normalized) photo. Set for photo-to-page. */
  imageUrl?: string;
  /** What to draw. Set for text-to-page. */
  prompt?: string;
  style: ColoringStyle;
  /** Hint so the output matches the photo shape. Defaults to portrait. */
  orientation?: "portrait" | "landscape" | "square";
};

export type GenerateColoringPageResult = {
  image: Buffer;
  mimeType: "image/png";
};

export interface ColoringPageProvider {
  name: string;
  generateColoringPage(input: GenerateColoringPageInput): Promise<GenerateColoringPageResult>;
}

let cached: ColoringPageProvider | null = null;

export function getProvider(): ColoringPageProvider {
  if (cached) return cached;
  const name = (process.env.AI_PROVIDER || "openai").toLowerCase();
  switch (name) {
    case "openai":
      cached = createOpenAIProvider(requireEnv("AI_API_KEY"));
      return cached;
    case "fal":
    case "replicate":
      throw new Error(`AI_PROVIDER "${name}" is not implemented yet. Use "openai".`);
    default:
      throw new Error(`Unknown AI_PROVIDER "${name}".`);
  }
}

export async function generateColoringPage(
  input: GenerateColoringPageInput,
): Promise<GenerateColoringPageResult> {
  if (!input.imageUrl && !input.prompt) {
    throw new Error("generateColoringPage needs imageUrl or prompt");
  }
  return getProvider().generateColoringPage(input);
}
