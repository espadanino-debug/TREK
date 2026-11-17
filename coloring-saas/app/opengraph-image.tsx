import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name}: turn any photo into a coloring page`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#fffbf5",
          color: "#1f2937",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700, color: "#6d28d9" }}>{siteConfig.name}</div>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.1, marginTop: 20 }}>
          Turn any photo into a coloring page
        </div>
        <div style={{ fontSize: 34, marginTop: 28, color: "#6b7280" }}>
          Free · Printable PDF for US Letter and A4
        </div>
      </div>
    ),
    size,
  );
}
