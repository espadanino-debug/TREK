import "server-only";

import sharp from "sharp";
import { UserFacingError } from "@/lib/errors";
import { WATERMARK_PNG_BASE64 } from "./watermark-data";

const HEIF_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1", "heif"]);

function isHeif(buf: Buffer): boolean {
  if (buf.length < 12 || buf.toString("ascii", 4, 8) !== "ftyp") return false;
  return HEIF_BRANDS.has(buf.toString("ascii", 8, 12));
}

const UNREADABLE = new UserFacingError(
  "bad_image",
  "We couldn't read that file. Please upload a JPG, PNG or HEIC photo.",
);

export type NormalizedPhoto = {
  jpeg: Buffer;
  thumb: Buffer;
  orientation: "portrait" | "landscape" | "square";
};

/**
 * Converts an upload (JPG, PNG or iPhone HEIC) into a clean JPEG:
 * auto-rotated, max 1536px, and with all EXIF/GPS metadata removed.
 */
export async function normalizePhoto(input: Buffer): Promise<NormalizedPhoto> {
  let source = input;

  if (isHeif(input)) {
    try {
      const { default: convert } = await import("heic-convert");
      const out = await convert({ buffer: input, format: "JPEG", quality: 0.92 });
      source = Buffer.from(out);
    } catch {
      throw UNREADABLE;
    }
  }

  let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    meta = await sharp(source).metadata();
  } catch {
    throw UNREADABLE;
  }
  if (!meta.format || !["jpeg", "png", "webp", "heif"].includes(meta.format)) throw UNREADABLE;

  const pipeline = sharp(source, { limitInputPixels: 100_000_000 })
    .rotate() // apply EXIF orientation, then metadata is dropped on output
    .flatten({ background: "#ffffff" })
    .resize({ width: 1536, height: 1536, fit: "inside", withoutEnlargement: true });

  const { data: jpeg, info } = await pipeline
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  const thumb = await sharp(jpeg)
    .resize({ width: 512, height: 512, fit: "inside" })
    .jpeg({ quality: 80 })
    .toBuffer();

  const ratio = info.width / info.height;
  const orientation = ratio > 1.15 ? "landscape" : ratio < 0.87 ? "portrait" : "square";

  return { jpeg, thumb, orientation };
}

/**
 * Turns the AI output into a clean printable PNG: white background, grayscale,
 * and (for free outputs) a small watermark in the bottom-right corner.
 */
export async function finalizeColoringPage(
  aiImage: Buffer,
  { watermark }: { watermark: boolean },
): Promise<{ png: Buffer; width: number; height: number }> {
  const { data: base, info } = await sharp(aiImage)
    .flatten({ background: "#ffffff" })
    .grayscale()
    .png()
    .toBuffer({ resolveWithObject: true });

  let image = sharp(base);

  if (watermark) {
    const markWidth = Math.round(info.width * 0.34);
    const mark = await sharp(Buffer.from(WATERMARK_PNG_BASE64, "base64"))
      .resize({ width: markWidth })
      .png()
      .toBuffer({ resolveWithObject: true });
    const margin = Math.round(info.width * 0.02);
    image = image.composite([
      {
        input: mark.data,
        left: info.width - mark.info.width - margin,
        top: info.height - mark.info.height - margin,
      },
    ]);
  }

  // Second pass: composite adds an alpha channel, so flatten again and save as 8-bit grayscale.
  const composed = await image.png().toBuffer();
  const png = await sharp(composed)
    .flatten({ background: "#ffffff" })
    .toColourspace("b-w")
    .png({ compressionLevel: 9 })
    .toBuffer();
  return { png, width: info.width, height: info.height };
}
