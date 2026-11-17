import type { ColoringStyle } from "@/config/site";

const COMMON_RULES = [
  "Pure black lines on a pure white background.",
  "No color, no gray fills, no shading, no gradients, no hatching on large areas.",
  "Closed outlines so every area can be colored in.",
  "No text, letters, numbers, logos or signatures anywhere.",
  "No border or frame.",
].join(" ");

const STYLE_RULES: Record<ColoringStyle, string> = {
  simple:
    "Style: simple coloring page for young kids. Thick, bold, smooth outlines. Large shapes, few details, very simple or empty background.",
  detailed:
    "Style: detailed coloring page for adults. Fine, crisp, even ink lines. Rich detail, decorative patterns and textures drawn as line work, a detailed background.",
};

export function photoPrompt(style: ColoringStyle): string {
  return [
    "Turn this photo into a printable black-and-white coloring page (line art).",
    "Keep the main people, animals and objects recognizable, with the same pose and composition.",
    "Trace their important features as clean outlines. Remove all photographic color and shading.",
    STYLE_RULES[style],
    COMMON_RULES,
  ].join(" ");
}

export function textPrompt(userPrompt: string, style: ColoringStyle): string {
  return [
    `A printable black-and-white coloring page (line art) of: ${userPrompt.trim()}.`,
    "Original character and design, cute and friendly.",
    STYLE_RULES[style],
    COMMON_RULES,
  ].join(" ");
}
