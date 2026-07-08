// EmbossedText3D.tsx — "chữ 3D" đúng bản sắc kênh LDN: nổi khối/raised texture
// bằng CSS thuần (layered text-shadow đùn khối + viền sáng), thay cho kỹ
// thuật Metal/Ice Extrude dùng Three.js ở Nhóm B trong
// Du-lieu-lam-video/ho-so-ky-thuat-hieu-ung-chu.md — vì phong cách kênh vốn
// đã là "colorful, 3D embossed hand-painting style with raised textures"
// (xem CLAUDE.md), không cần cài thêm package 3D hay chuẩn bị font/asset
// ngoài như hồ sơ gốc yêu cầu.
import React from "react";
import { interpolate } from "remotion";

const FONT_HEADING = '"Arial Black", "Arial Bold", Arial, sans-serif';
const EXTRUDE_LAYERS = 7;

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(((n >> 16) & 0xff) + amount);
  const g = clamp(((n >> 8) & 0xff) + amount);
  const b = clamp((n & 0xff) + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

export const EmbossedText3D: React.FC<{
  frame: number;
  text: string;
  color: string; // accentColor thương hiệu
  fontSize?: number;
  durationFrames?: number;
}> = ({ frame, text, color, fontSize = 72, durationFrames = 106 }) => {
  if (frame < 0 || frame > durationFrames) return null;

  const ENTER = 16;
  const EXIT = 16;

  const pop = interpolate(frame, [0, ENTER], [0.4, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
  });
  const tiltX = interpolate(frame, [0, ENTER], [28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const opacity = interpolate(frame, [0, 8, durationFrames - EXIT, durationFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const extrudeShadow = Array.from({ length: EXTRUDE_LAYERS })
    .map((_, i) => `${i + 1}px ${i + 1}px 0 ${shade(color, -40 - i * 6)}`)
    .join(", ");

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        opacity,
        transform: `translate(-50%, -50%) perspective(700px) rotateX(${tiltX}deg) scale(${pop})`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: FONT_HEADING,
          fontWeight: 900,
          fontSize,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color,
          textShadow: `${extrudeShadow}, 0 ${EXTRUDE_LAYERS + 6}px 26px rgba(0,0,0,0.65)`,
          WebkitTextStroke: "1px rgba(255,255,255,0.28)",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};
