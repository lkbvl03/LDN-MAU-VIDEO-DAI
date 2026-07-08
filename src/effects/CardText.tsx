// CardText.tsx — "Card text" cho các khoảnh khắc tiêu đề/trích dẫn giữa video.
// Chuyển thể từ Nhóm A (Card Hồng Kông, Hollywood) + B6/B7 (Neon, Gold Foil)
// trong Du-lieu-lam-video/ho-so-ky-thuat-hieu-ung-chu.md — nhưng LUÔN dùng
// bảng màu thương hiệu (Du-lieu-lam-video/thuong-hieu-LDN.txt) thay cho màu
// ví dụ gốc trong hồ sơ (đỏ/vàng kim Hồng Kông, neon hồng...), theo đúng quy
// tắc ở CLAUDE.md Bước 7: "không tự ý sáng tạo màu/style ngoài hồ sơ".
import React from "react";
import { interpolate } from "remotion";

const FONT_HEADING = '"Arial Black", "Arial Bold", Arial, sans-serif';
const FONT_BODY = '"Segoe UI", "Arial", sans-serif';
const OBSIDIAN = "#0A0A0F";
const IVORY = "#F5F5F0";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export type CardTextVariant = "impact" | "cinematic" | "neon" | "foil";

// Thời lượng mỗi variant (frame @ 30fps) — theo đúng mốc thời lượng
// hồ sơ đề xuất (A1: 2-3s, A2: 3-4s, B6/B7 tương đương card ngắn/vừa).
export const CARD_TEXT_DURATION: Record<CardTextVariant, number> = {
  impact: 80, // ~2.7s — đập vào, giữ, tắt (Nhóm A1 — Hồng Kông)
  cinematic: 120, // ~4s — mờ dần hiện ra + lens flare (Nhóm A2 — Hollywood)
  neon: 115, // ~3.8s — chữ neon nhấp nháy (Nhóm B6)
  foil: 100, // ~3.3s — chữ dát kim loại đập mạnh (Nhóm B7)
};

type CardProps = {
  frame: number;
  title: string;
  subtitle?: string;
  color: string;
  total: number;
};

// ─── A1. Impact Card (gốc: phong cách Hồng Kông cổ điển) ─────────────────
const ImpactCard: React.FC<CardProps> = ({ frame, title, subtitle, color, total }) => {
  const scale = interpolate(frame, [0, 8], [1.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });
  const shakeX =
    frame < 4 ? interpolate(frame, [0, 4], [7, 0], { extrapolateRight: "clamp" }) * Math.sin(frame * 3) : 0;
  const opacity = interpolate(frame, [0, 6, total - 12, total], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        opacity,
        transform: `translate(-50%, -50%) scale(${scale}) translateX(${shakeX}px)`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: `${OBSIDIAN}e6`,
          border: `2px solid ${color}`,
          borderRadius: 10,
          padding: "24px 48px",
          boxShadow: `0 0 40px ${color}55`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_HEADING,
            fontWeight: 900,
            fontSize: 58,
            color: IVORY,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            WebkitTextStroke: `2px ${color}`,
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 22,
              color,
              marginTop: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── A2. Cinematic Card (gốc: phong cách Hollywood) ───────────────────────
const CinematicCard: React.FC<CardProps> = ({ frame, title, subtitle, color, total }) => {
  const blur = interpolate(frame, [0, 45], [18, 0], { extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [0, 45, total - 22, total], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, total], [1.05, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flareX = interpolate(frame, [12, 60], [-400, 2960], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: flareX,
          top: "35%",
          width: 220,
          height: 700,
          background: `linear-gradient(90deg, transparent, ${color}55, transparent)`,
          transform: "rotate(18deg)",
        }}
      />
      <div
        style={{
          filter: `blur(${blur}px)`,
          opacity,
          transform: `scale(${scale})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONT_HEADING,
            fontWeight: 900,
            fontSize: 76,
            letterSpacing: "0.10em",
            color: IVORY,
            textShadow: `0 0 40px ${color}90`,
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontFamily: FONT_BODY,
              fontStyle: "italic",
              fontSize: 26,
              color,
              marginTop: 14,
              letterSpacing: "0.08em",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── B6. Neon Card (gốc: Neon Glow) ────────────────────────────────────────
const NeonCard: React.FC<Omit<CardProps, "subtitle">> = ({ frame, title, color, total }) => {
  const flicker = frame % 45 < 3 ? 0.55 : 1;
  const opacity = interpolate(frame, [0, 10, total - 15, total], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        opacity: opacity * flicker,
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: FONT_HEADING,
          fontWeight: 900,
          fontSize: 84,
          color,
          textTransform: "uppercase",
          textShadow: `0 0 10px ${color}, 0 0 24px ${color}, 0 0 48px ${color}, 0 0 90px ${color}80`,
        }}
      >
        {title}
      </div>
    </div>
  );
};

// ─── B7. Foil Card (gốc: Gold Foil Impact, tái hiện bằng accent + highlight) ─
const FoilCard: React.FC<CardProps & { highlightColor: string }> = ({
  frame,
  title,
  subtitle,
  color,
  highlightColor,
  total,
}) => {
  const skew = interpolate(frame, [0, 14], [-8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutBack,
  });
  const scale = interpolate(frame, [0, 14], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutBack,
  });
  const opacity = interpolate(frame, [0, 14, total - 15, total], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        opacity,
        transform: `translate(-50%, -50%) skewX(${skew}deg) scale(${scale})`,
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: FONT_HEADING,
          fontWeight: 900,
          fontSize: 80,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          background: `linear-gradient(135deg, ${highlightColor} 0%, ${color} 30%, ${highlightColor} 55%, ${color} 80%, ${highlightColor} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: `drop-shadow(0 4px 10px rgba(0,0,0,0.6))`,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 22,
            color: IVORY,
            marginTop: 8,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.85,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};

// ─── Export tổng ────────────────────────────────────────────────────────────
export const CardTextEffect: React.FC<{
  frame: number;
  title: string;
  subtitle?: string;
  variant: CardTextVariant;
  color: string; // accentColor thương hiệu — truyền từ VIDEO_CONFIG hoặc effect item
  highlightColor?: string; // dùng riêng cho variant "foil" — mặc định Data Yellow
}> = ({ frame, title, subtitle, variant, color, highlightColor = "#FFD60A" }) => {
  const total = CARD_TEXT_DURATION[variant];
  if (frame < 0 || frame > total) return null;

  switch (variant) {
    case "impact":
      return <ImpactCard frame={frame} title={title} subtitle={subtitle} color={color} total={total} />;
    case "cinematic":
      return <CinematicCard frame={frame} title={title} subtitle={subtitle} color={color} total={total} />;
    case "neon":
      return <NeonCard frame={frame} title={title} color={color} total={total} />;
    case "foil":
      return (
        <FoilCard
          frame={frame}
          title={title}
          subtitle={subtitle}
          color={color}
          highlightColor={highlightColor}
          total={total}
        />
      );
    default:
      return null;
  }
};
