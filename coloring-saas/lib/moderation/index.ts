import "server-only";

import { limits } from "@/config/site";
import { optionalEnv } from "@/lib/env";
import { UserFacingError } from "@/lib/errors";
import { findBlockedTerm } from "./blocklist";

export const TRADEMARK_MESSAGE =
  "We can't make pages of famous characters or brands (like Pokemon, Bluey or Disney) because they belong to their creators. Try describing your own character instead, like \"a happy blue puppy with big floppy ears\".";

const REJECTED_IMAGE_MESSAGE =
  "We can't use this photo. Please choose a family-friendly picture and try again.";
const REJECTED_PROMPT_MESSAGE =
  "We can't draw that one. Please try a family-friendly idea, like \"a dinosaur having a birthday party\".";

type ModerationResult = {
  results?: { flagged: boolean; categories: Record<string, boolean> }[];
};

// Categories that block an upload. Text prompts are blocked on any flag.
const BLOCKED_IMAGE_CATEGORIES = ["sexual", "sexual/minors", "violence/graphic", "self-harm/intent"];

function moderationKey(): string | undefined {
  // The moderation endpoint is free with an OpenAI key. With another image provider,
  // set OPENAI_MODERATION_KEY to keep image checks on.
  return (
    optionalEnv("OPENAI_MODERATION_KEY") ??
    ((process.env.AI_PROVIDER || "openai") === "openai" ? optionalEnv("AI_API_KEY") : undefined)
  );
}

async function moderate(input: unknown): Promise<ModerationResult["results"]> {
  const key = moderationKey();
  if (!key) {
    console.warn("[moderation] No OpenAI key configured; skipping moderation API check.");
    return undefined;
  }
  const res = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "omni-moderation-latest", input }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Moderation API error ${res.status}`);
  const body = (await res.json()) as ModerationResult;
  return body.results;
}

/** Validates a text prompt. Throws a UserFacingError if it can't be used. */
export async function checkPrompt(raw: string): Promise<string> {
  const prompt = raw.replace(/\s+/g, " ").trim();
  if (prompt.length < limits.minPromptLength) {
    throw new UserFacingError("prompt_too_short", "Please describe what you'd like to color.");
  }
  if (prompt.length > limits.maxPromptLength) {
    throw new UserFacingError(
      "prompt_too_long",
      `Please keep your idea under ${limits.maxPromptLength} characters.`,
    );
  }
  if (findBlockedTerm(prompt)) {
    throw new UserFacingError("trademark", TRADEMARK_MESSAGE, 422);
  }
  const results = await moderate([{ type: "text", text: prompt }]);
  if (results?.some((r) => r.flagged)) {
    throw new UserFacingError("rejected_content", REJECTED_PROMPT_MESSAGE, 422);
  }
  return prompt;
}

/** Rejects explicit or graphic images. Pass a small JPEG for speed. */
export async function checkImage(jpeg: Buffer): Promise<void> {
  const dataUrl = `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  const results = await moderate([{ type: "image_url", image_url: { url: dataUrl } }]);
  const blocked = results?.some((r) =>
    BLOCKED_IMAGE_CATEGORIES.some((category) => r.categories?.[category]),
  );
  if (blocked) {
    throw new UserFacingError("rejected_content", REJECTED_IMAGE_MESSAGE, 422);
  }
}
