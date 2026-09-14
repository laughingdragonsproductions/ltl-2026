import { ImageResponse } from "next/og";

export const alt = "LTL26 — Louder Than Life 2026 Live Map & Schedule";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0f",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ color: "#9b30ff", fontSize: 28, letterSpacing: 8, fontWeight: 700 }}>
          LOUDER THAN LIFE 2026
        </div>
        <div
          style={{
            color: "#39ff14",
            fontSize: 72,
            fontWeight: 900,
            marginTop: 16,
            textShadow: "0 0 40px rgba(57,255,20,0.5)",
          }}
        >
          LTL26
        </div>
        <div style={{ color: "#e8e8f0", fontSize: 32, marginTop: 24 }}>
          Live Map & Schedule
        </div>
        <div style={{ color: "#9ca3af", fontSize: 22, marginTop: 12 }}>
          Sept 17–20 · Louisville · Unofficial fan guide
        </div>
      </div>
    ),
    { ...size }
  );
}
