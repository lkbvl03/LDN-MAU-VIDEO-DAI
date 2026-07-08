# HỒ SƠ KỸ THUẬT: MẪU CARD TEXT \& HIỆU ỨNG CHỮ 3D

## Dùng cho dự án Remotion (LDN-MAU-VIDEO-DAI) — gửi cho Claude Code triển khai

\---

## 0\. GHI CHÚ TRƯỚC KHI GỬI CHO CLAUDE CODE

Dự án đang dùng **Remotion** (React + TypeScript, thấy rõ qua `remotion.config.ts`, `Root.tsx`, `Scenes.tsx`, `Effects.tsx`). Tất cả code mẫu dưới đây viết theo chuẩn Remotion, đặt trong file `Effects.tsx` hoặc tách riêng từng file trong `src/effects/`.

Khi gửi cho Claude Code, có thể dùng nguyên câu lệnh:

> "Đọc file ho-so-ky-thuat-hieu-ung-chu.md, tạo các component hiệu ứng chữ trong thư mục src/effects/ theo đúng thông số kỹ thuật, tích hợp vào Effects.tsx để dùng trong Scenes.tsx"

\---

## 1\. NHÓM A — CARD TEXT (THẺ TIÊU ĐỀ / GIỚI THIỆU)

### A1. Card phong cách Hồng Kông cổ điển (võ thuật, xã hội đen 80-90s)

**Thông số kỹ thuật:**

|Thuộc tính|Giá trị|
|-|-|
|Font chữ|Font thư pháp/nét dày — gợi ý: `Ma Shan Zheng`, `Noto Serif SC`, hoặc font Việt nét đậm `Montserrat Black`|
|Màu chữ|Đỏ `#C8102E` hoặc vàng kim `#D4AF37`|
|Viền chữ|Đen `#0A0A0A`, dày 3-4px|
|Nền|Tối `#000000`, có lớp khói/bụi mờ phủ (opacity 20-30%)|
|Hiệu ứng vào|Đập vào (impact) — scale từ 1.3 → 1.0 trong 6 frame, kèm rung màn hình (shake) 2 frame đầu|
|Thời lượng hiện|60-90 frame (2-3s ở 30fps)|
|Âm thanh đi kèm|Tiếng "bụp/thịch" tại frame xuất hiện|

**Cấu trúc component gợi ý (Remotion):**

```tsx
// src/effects/HongKongCard.tsx
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface HongKongCardProps {
  title: string;
  subtitle?: string;
}

export const HongKongCard: React.FC<HongKongCardProps> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, from: 1.3, to: 1, config: { damping: 12 } });
  const shakeX = frame < 4 ? interpolate(frame, \[0, 4], \[8, 0]) \* Math.sin(frame \* 3) : 0;
  const opacity = interpolate(frame, \[0, 6], \[0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: '#000' }}>
      <div style={{
        transform: `scale(${scale}) translateX(${shakeX}px)`,
        opacity,
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 900,
        fontSize: 90,
        color: '#D4AF37',
        WebkitTextStroke: '4px #0A0A0A',
        textAlign: 'center',
      }}>
        {title}
        {subtitle \&\& (
          <div style={{ fontSize: 32, color: '#C8102E', marginTop: 12, WebkitTextStroke: '2px #0A0A0A' }}>
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
```

### A2. Card phong cách Hollywood cinematic

**Thông số kỹ thuật:**

|Thuộc tính|Giá trị|
|-|-|
|Font chữ|`Bebas Neue`, `Anton`, hoặc `Cinzel` (trang trọng)|
|Màu chữ|Trắng/bạc `#F5F5F5` hoặc vàng kim loại gradient|
|Hiệu ứng|Chữ mờ dần hiện ra từ sương mù (blur 20px → 0px), kèm lens flare quét ngang|
|Camera|Zoom nhẹ ra (scale 1.05 → 1.0) suốt thời gian hiện|
|Thời lượng|90-120 frame (3-4s)|

**Cấu trúc component gợi ý:**

```tsx
// src/effects/HollywoodCard.tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const HollywoodCard: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const blur = interpolate(frame, \[0, 40], \[20, 0], { extrapolateRight: 'clamp' });
  const opacity = interpolate(frame, \[0, 40], \[0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(frame, \[0, 120], \[1.05, 1]);
  const flareX = interpolate(frame, \[10, 50], \[-200, 800], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#000', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: flareX, top: '40%', width: 150, height: 400,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        transform: 'rotate(20deg)' }} />
      <div style={{
        filter: `blur(${blur}px)`, opacity, transform: `scale(${scale})`,
        fontFamily: 'Bebas Neue, sans-serif', fontSize: 110, letterSpacing: 6,
        color: '#F5F5F5', textShadow: '0 0 30px rgba(212,175,55,0.6)',
      }}>
        {title}
      </div>
    </AbsoluteFill>
  );
};
```

\---

## 2\. NHÓM B — KỸ XẢO CHỮ 3D

Vì Remotion chạy trên nền web (DOM/CSS/Canvas), chữ 3D thật (dùng render engine như C4D/Blender) cần dựng sẵn thành **video/PNG sequence có nền trong suốt (alpha channel)** rồi import vào Remotion bằng `<Video>` hoặc `<Img>` với `<Sequence>`. Riêng các hiệu ứng có thể giả lập bằng CSS 3D transform + Three.js (qua `@remotion/three`) thì làm trực tiếp trong code.

### B1. Metal Extrude (chữ kim loại nổi khối)

* **Cách làm chuẩn**: dựng trong Cinema 4D/Blender, render PNG sequence có alpha, import vào Remotion
* **Cách làm nhanh trong Remotion** (dùng `@remotion/three` + React Three Fiber):

```tsx
// src/effects/MetalText3D.tsx
import { ThreeCanvas } from '@remotion/three';
import { Text3D, MeshReflectorMaterial } from '@react-three/drei';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const MetalText3D: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const rotationY = (frame / 60) \* Math.PI \* 0.3;

  return (
    <ThreeCanvas width={width} height={height}>
      <ambientLight intensity={0.4} />
      <pointLight position={\[5, 5, 5]} intensity={1.2} />
      <group rotation={\[0, rotationY, 0]}>
        <Text3D font="/fonts/helvetiker\_bold.json" size={1.5} height={0.4} bevelEnabled bevelThickness={0.05}>
          {text}
          <meshStandardMaterial metalness={1} roughness={0.15} color="#C0C0C0" />
        </Text3D>
      </group>
    </ThreeCanvas>
  );
};
```

* **Cần cài thêm package**: `@remotion/three`, `three`, `@react-three/fiber`, `@react-three/drei`

### B2. Fire/Lava Text (chữ cháy lửa)

* **Cách làm**: overlay video lửa (footage có sẵn, nền đen) lên chữ dùng `mix-blend-mode: screen` hoặc dùng làm mask

```tsx
// src/effects/FireText.tsx
import { AbsoluteFill, Video, staticFile } from 'remotion';

export const FireText: React.FC<{ text: string }> = ({ text }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <div style={{
      WebkitMaskImage: `url(#fire-text-mask)`,
      maskImage: `url(#fire-text-mask)`,
      width: '100%', height: '100%',
    }}>
      <Video src={staticFile('fire-loop.mp4')} style={{ mixBlendMode: 'screen', width: '100%' }} />
    </div>
    <svg width="0" height="0">
      <clipPath id="fire-text-mask" clipPathUnits="objectBoundingBox">
        {/\* Text path SVG cần export từ font, hoặc dùng foreignObject text \*/}
      </clipPath>
    </svg>
  </AbsoluteFill>
);
```

* **Cần chuẩn bị trước**: 1 đoạn video lửa loop (footage stock, nền đen) đặt vào `public/fire-loop.mp4`

### B3. Ice/Crystal Text (chữ pha lê)

* Dùng CSS `backdrop-filter: blur()` + gradient để giả lập khúc xạ, hoặc dùng Three.js `MeshPhysicalMaterial` với `transmission: 1`

```tsx
material={<meshPhysicalMaterial transmission={1} thickness={0.5} roughness={0.05} ior={1.5} color="#AEEFFF" />}
```

### B4. Disintegration (chữ tan thành hạt/khói)

* **Kỹ thuật**: dùng particle system — có thể làm bằng Three.js `Points` hoặc overlay video particle stock

```tsx
// Ý tưởng: text hiện bình thường ở frame đầu, sau đó fade + particle overlay bay theo hướng gió
const particleOpacity = interpolate(frame, \[startDisintegrate, startDisintegrate + 30], \[1, 0]);
```

* Khuyến nghị: dùng sẵn plugin **Element 3D (After Effects)** dựng trước thành video overlay, import vào Remotion — nhanh và đẹp hơn code tay

### B5. Shatter/Glass Break (chữ vỡ)

* Tương tự Disintegration — nên dựng sẵn bằng After Effects (plugin Shatter) hoặc Blender rồi render ra video overlay có alpha, import vào Remotion bằng `<Video>` với `<Sequence from={...}>`

### B6. Neon Glow (chữ phát sáng neon)

* Làm được hoàn toàn bằng CSS, không cần 3D engine:

```tsx
// src/effects/NeonText.tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const NeonText: React.FC<{ text: string; color?: string }> = ({ text, color = '#FF00E6' }) => {
  const frame = useCurrentFrame();
  const flicker = frame % 45 < 3 ? 0.6 : 1; // hiệu ứng nhấp nháy nhẹ

  return (
    <AbsoluteFill style={{ background: '#0A0014', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        fontFamily: 'Anton, sans-serif', fontSize: 100, color,
        opacity: flicker,
        textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}, 0 0 80px ${color}`,
      }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};
```

### B7. Gold Foil Impact (chữ dát vàng, đập mạnh)

* Kết hợp giữa A1 (impact) + gradient vàng kim loại:

```tsx
background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #B8860B 75%, #FFD700 100%)',
WebkitBackgroundClip: 'text',
WebkitTextFillColor: 'transparent',
```

\---

## 3\. BẢNG TỔNG HỢP — MỨC ĐỘ KHẢ THI TRONG REMOTION

|Hiệu ứng|Làm trực tiếp trong Remotion?|Cần chuẩn bị trước|
|-|-|-|
|Card Hồng Kông|✅ Có (CSS/spring)|Không cần|
|Card Hollywood|✅ Có (CSS)|Không cần|
|Metal Extrude 3D|✅ Có (Three.js qua @remotion/three)|Cần cài package + font JSON|
|Fire/Lava Text|⚠️ Cần footage lửa|Video lửa nền đen (stock)|
|Ice/Crystal Text|✅ Có (Three.js)|Cần cài package|
|Disintegration|⚠️ Nên dựng sẵn ngoài|Video particle overlay (AE/Blender)|
|Shatter/Glass|⚠️ Nên dựng sẵn ngoài|Video overlay có alpha (AE/Blender)|
|Neon Glow|✅ Có (CSS thuần)|Không cần|
|Gold Foil Impact|✅ Có (CSS gradient)|Không cần|

\---

## 4\. YÊU CẦU GỬI CHO CLAUDE CODE

Gợi ý nội dung tin nhắn gửi Claude Code:

> "Dựa theo file ho-so-ky-thuat-hieu-ung-chu.md vừa upload, hãy: 1) Tạo thư mục src/effects/ với các component NeonText.tsx, HongKongCard.tsx, HollywoodCard.tsx, GoldFoilText.tsx (4 hiệu ứng làm được ngay bằng CSS). 2) Cài thêm package cần thiết cho MetalText3D.tsx (@remotion/three, three, @react-three/fiber, @react-three/drei). 3) Tạo 1 file demo Scenes.tsx thử lần lượt từng hiệu ứng để tôi xem trước."

Các hiệu ứng cần footage/video dựng sẵn (Fire, Disintegration, Shatter) — bạn cần chuẩn bị file video trước và để vào thư mục `public/`, rồi báo tên file cho Claude Code biết để tích hợp.

