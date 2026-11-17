import "server-only";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { siteConfig } from "@/config/site";

export type PaperSize = "letter" | "a4";

// Sizes in PDF points (1 inch = 72 pt).
const PAPER: Record<PaperSize, [number, number]> = {
  letter: [612, 792], // 8.5 x 11 in (US default)
  a4: [595.28, 841.89], // 210 x 297 mm
};

const MARGIN = 36; // 0.5 inch, safe for home printers

/** Places the coloring page on one printable page, rotated to fit its shape. */
export async function buildColoringPdf(
  png: Buffer,
  { paper, watermark, title }: { paper: PaperSize; watermark: boolean; title: string },
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(title);
  pdf.setCreator(siteConfig.name);
  pdf.setProducer(siteConfig.name);

  const image = await pdf.embedPng(png);
  const landscape = image.width > image.height;
  const [w, h] = PAPER[paper];
  const [pageW, pageH] = landscape ? [h, w] : [w, h];
  const page = pdf.addPage([pageW, pageH]);

  const footer = watermark ? 18 : 0;
  const maxW = pageW - MARGIN * 2;
  const maxH = pageH - MARGIN * 2 - footer;
  const scale = Math.min(maxW / image.width, maxH / image.height);
  const drawW = image.width * scale;
  const drawH = image.height * scale;

  page.drawImage(image, {
    x: (pageW - drawW) / 2,
    y: MARGIN + footer + (maxH - drawH) / 2,
    width: drawW,
    height: drawH,
  });

  if (watermark) {
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const host = siteConfig.url.replace(/^https?:\/\//, "");
    const text = `Made with ${siteConfig.name} - ${host}`;
    const size = 9;
    page.drawText(text, {
      x: (pageW - font.widthOfTextAtSize(text, size)) / 2,
      y: MARGIN,
      size,
      font,
      color: rgb(0.45, 0.45, 0.45),
    });
  }

  return pdf.save();
}
