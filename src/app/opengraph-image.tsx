import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Resume Roaster PH — Get Your Resume Roasted";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#111111",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          gap: 0,
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "flex",
            background: "#2a1a10",
            border: "1px solid #5a2d10",
            borderRadius: 999,
            padding: "8px 20px",
            fontSize: 18,
            color: "#ff6a33",
            letterSpacing: "0.12em",
            fontWeight: 700,
            marginBottom: 32,
            textTransform: "uppercase",
          }}
        >
          🇵🇭 For Filipinos, By Filipinos
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-2px",
          }}
        >
          <span style={{ color: "#ffffff" }}>Resume Roaster&nbsp;</span>
          <span style={{ color: "#ff4500" }}>PH</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 24,
            gap: 4,
          }}
        >
          <span style={{ fontSize: 28, color: "#888888" }}>
            Paste your resume. We&apos;ll accept it with open arms.
          </span>
          <span style={{ fontSize: 28, color: "#ffffff", fontWeight: 700 }}>
            And roast it with zero mercy.
          </span>
        </div>

        {/* CTA pill */}
        <div
          style={{
            display: "flex",
            marginTop: 48,
            background: "#ff4500",
            borderRadius: 12,
            padding: "16px 48px",
            fontSize: 28,
            fontWeight: 700,
            color: "#ffffff",
          }}
        >
          Roast me 🔥
        </div>
      </div>
    ),
    size
  );
}
