# CLAUDE.md — Remotion Short-form Video Template

Template Remotion cho video short-form (Shorts/Reels/TikTok) phong cách **"A colorful,
3D embossed hand-painting style with raised textures and bold brushstrokes"** theo hồ
sơ thương hiệu kênh LẠ ĐỜI NHẤT.
Layout: **1080×1920 (9:16, dọc)**, nhiều mốc sự kiện, text & icon nổi màu sắc ấn tượng.

Bảng màu, font, giọng điệu chuẩn kênh: xem [`Du-lieu-lam-video/thuong-hieu-LDN.txt`](Du-lieu-lam-video/thuong-hieu-LDN.txt)
(hồ sơ thương hiệu — nguồn sự thật duy nhất cho mọi màu sắc & phong cách hình ảnh).

---

## Kiến trúc: mỗi SCENE = 1 ảnh/video nền + 1 file giọng đọc riêng

Mỗi phân cảnh (`Scene` trong `src/data.ts`) có: 1 đoạn kịch bản riêng, 1
ảnh/video nền riêng, 1 file giọng đọc riêng (`public/voice/scene-NN.mp3`).
Các scene được ghép **nối tiếp nhau** — thời lượng hiển thị của mỗi ảnh/video
= ĐÚNG thời lượng thật của file giọng đọc scene đó. Remotion tự tính tổng thời
lượng composition lúc runtime bằng `calculateMetadata` (`src/calculateMetadata.ts`,
dùng `@remotion/media-utils` đọc thời lượng audio thật) — KHÔNG cần ước lượng
trước rồi sửa tay, KHÔNG cần script "remap".

## Phân công nhiệm vụ (quy trình Claude thực hiện, theo đúng thứ tự)

Nhiệm vụ là: **nhận chủ đề + nền tảng + thời lượng → viết kịch bản → chờ xác
nhận → phân tích + tạo file KB.txt → chờ đủ tài nguyên → tạo âm thanh →
dựng video → chờ xác nhận lần 2 → render.**
Không nhảy cóc bước nào, không tự ý render khi chưa qua đủ 2 lần xác nhận.

1. **Nhận chủ đề, viết kịch bản** — Claude nhận **chủ đề + nền tảng (Shorts/
   Reels/TikTok...) + thời lượng mong muốn** từ người dùng, viết **toàn bộ
   kịch bản giọng đọc** (văn xuôi liền mạch) dựa trên **toàn bộ dữ liệu trong
   thư mục [`Du-lieu-lam-video/`](Du-lieu-lam-video/)**:
   - [`HO-SO-VIET-KICH-BAN.txt`](Du-lieu-lam-video/HO-SO-VIET-KICH-BAN.txt) —
     khung kịch bản & cách viết:
     - Chọn 1 mẫu hook phù hợp trong 12 nhóm (Phần 2) — 3 giây đầu vào thẳng
       vấn đề, không giới thiệu/chào hỏi
     - Dựng khung theo Phần 4: hook (0-3s) → setup (3-8s) → phát triển ý
       (8-70%, mỗi 5-7 giây có 1 "điểm neo") → cao trào (70-90%) → kết + CTA
       (90-100%), co giãn theo thời lượng người dùng yêu cầu
     - Chọn 1 mẫu kết bài/CTA phù hợp trong 10 nhóm (Phần 3), ưu tiên **đóng
       vòng lặp** gọi lại câu hook mở đầu (Nhóm 2, Phần 3)
     - Rà lại toàn bộ câu chữ theo checklist văn phong Phần 6.6 (danh xưng
       nhất quán, dẫn chứng có nguồn, tránh trừu tượng/khẳng định tuyệt
       đối/áp đặt)
   - [`thuong-hieu-LDN.txt`](Du-lieu-lam-video/thuong-hieu-LDN.txt) — giọng
     điệu, màu sắc, định vị kênh phải khớp thương hiệu
   - [`ho-so-cac-mau-hieu-ung-text.txt`](Du-lieu-lam-video/ho-so-cac-mau-hieu-ung-text.txt),
     [`ho-so-cac-mau-hieu-ung-icon-3d.txt`](Du-lieu-lam-video/ho-so-cac-mau-hieu-ung-icon-3d.txt) —
     tham khảo để kịch bản có chỗ "gài" hiệu ứng/số liệu/icon tự nhiên
   - [`gioi-thieu-template.txt`](Du-lieu-lam-video/gioi-thieu-template.txt) —
     tổng quan kỹ thuật, tránh viết kịch bản vượt quá khả năng template
   - Chèn marker `[DỪNG Xs]` vào chỗ cần khoảng lặng (bảng marker — xem
     "Bước 1 — Điền `src/data.ts`" bên dưới)
   **CHƯA chia scene, CHƯA viết imagePrompt, CHƯA đụng vào `src/data.ts`.**

2. **Dừng lại, chờ xác nhận kịch bản** — gửi kịch bản cho người dùng đọc
   duyệt. **KHÔNG tự ý tiến hành bước tiếp theo cho tới khi người dùng xác
   nhận kịch bản OK.** Nếu người dùng yêu cầu sửa, sửa lại và chờ xác nhận lại.

3. **Sau khi kịch bản đã được xác nhận** — phân tích kịch bản đã duyệt, chia
   thành **bao nhiêu SCENE** (số lượng KHÔNG cố định — tuỳ độ dài/nhịp kịch
   bản, thường mỗi hook/luận-điểm/pattern-interrupt/kết là 1 scene riêng),
   rồi tạo file **`Du-lieu-lam-video/KB-<tên-video>.txt`** gồm 2 phần:
   - **Phần 1 — Giọng đọc**: với từng scene, tách kịch bản tại các marker
     `[DỪNG Xs]` thành đoạn đọc + khoảng lặng, ghi rõ tên file output theo
     đúng quy ước `public/voice/scene-NN.mp3` (NN khớp `id` scene)
   - **Phần 2 — Hình ảnh/video nền**: với từng scene, viết prompt tạo ảnh/
     video chuyên nghiệp, đầy đủ chi tiết, kỹ thuật (mô tả rõ chủ thể, hành
     động, bối cảnh, ánh sáng, **góc quay/chuyển động camera cụ thể**), **mỗi
     prompt viết trên đúng 1 dòng duy nhất**, luôn gắn video style nguyên văn
     **"A colorful, 3D embossed hand-painting style with raised textures and
     bold brushstrokes."** (xem chuẩn đầy đủ ở mục "Chuẩn viết prompt VEO3"
     bên dưới), ghi rõ tên file output khớp
     `public/images/bg/bg-NN.jpg` hoặc `bg-NN.mp4`

   Sau đó điền `SCENES` (id, label, text, imagePrompt) trong `src/data.ts`
   khớp đúng với file KB vừa tạo.

4. **Chờ đủ tài nguyên** — người dùng tự tạo giọng đọc và ảnh/video nền
   rồi gửi trực tiếp (không dùng API key). **Chưa đủ toàn bộ file video/ảnh
   nền + toàn bộ file giọng đọc từng scene thì chưa qua bước tiếp theo.**

5. **Tạo nhạc nền và hiệu ứng âm thanh** — chạy `generate_audio.py` (nhạc
   nền) và `generate_sfx2.py` (SFX), viết lại nội dung/mốc cảm xúc khớp
   kịch bản đã xác nhận (2 script này không tự sinh theo SCENES, cần điền
   tay nội dung mỗi video).

6. **Chạy pipeline tính thời gian** — `calc_scene_timing.py` để lấy mốc
   giây thật của từng scene, dùng số liệu đó viết `EFFECTS`
   (`src/Effects.tsx`) và `SFX_TIMELINE` (`src/RankingVideo.tsx`).

7. **Edit video** — tạo/tinh chỉnh hiệu ứng chuyển cảnh mượt mà, đẹp mắt
   (dùng các kỹ xảo điện ảnh: Ken Burns, cross-dissolve, flash, letterbox,
   glow... đã có sẵn trong `src/Scenes.tsx` + `src/Effects.tsx`), chuyển
   động cho ảnh/video nền.
   **Bắt buộc đối chiếu đúng theo
   [`Du-lieu-lam-video/thuong-hieu-LDN.txt`](Du-lieu-lam-video/thuong-hieu-LDN.txt)**
   trong suốt bước này — mọi màu sắc (accent color, highlight, overlay,
   glow...), font chữ, và phong cách hiệu ứng dùng khi edit phải khớp đúng
   hồ sơ thương hiệu, không tự ý sáng tạo màu/style ngoài hồ sơ.

8. **Xem bằng `npm start`** (Remotion Studio) — hoàn thiện, chỉnh sửa qua
   lại đến khi người dùng **xác nhận OK lần 2**. Đây là cổng xác nhận thứ
   hai (khác với xác nhận kịch bản ở bước 2) — **KHÔNG render khi chưa có
   xác nhận này.**

9. **Render** — chỉ sau khi đã xác nhận OK ở bước 8:
   `npx remotion render src/index.ts MyVideo out/video.mp4 --codec=h264 --crf=18`

---

## Khi làm video mới

> **Chỉ chỉnh `src/data.ts`. Không chỉnh file nào khác trong `src/`.**

### Bước 1 — Điền `src/data.ts`

Chỉnh 2 khu vực:

**`VIDEO_CONFIG`**
```typescript
title:         "TÊN VIDEO VIẾT HOA",
subtitle:      "Tagline ngắn",
accentColor:   "#FF3B30",    // chọn từ bảng màu bên dưới
hookTitle:     "Câu hook gây sốc",
hookSubtitle:  "Mở rộng hook",
ctaText:       "CTA TEXT",
source:        "Source A · Source B",
```

**`SCENES`** — mảng phân cảnh, số lượng biến thiên theo kịch bản
```typescript
{
  id: 0,
  label: "HOOK",         // "HOOK", "LĐ1", "PI1", "KẾT"...
  text: `...`,            // kịch bản RIÊNG của scene này, dùng marker khoảng lặng
  imagePrompt: "...",     // chỉ mô tả nội dung ảnh — không viết style
},
```

Marker khoảng lặng dùng trong `text` của mỗi scene:
```
[DỪNG 0.5s]   →  0.5 giây im lặng
[DỪNG 1s]     →  1.0 giây im lặng
[DỪNG 2s]     →  2.0 giây im lặng
[DỪNG 3s]     →  3.0 giây im lặng
[DỪNG 4s]     →  4.0 giây im lặng
[DỪNG AS]     →  3.5 giây im lặng (dấu ấn kênh LDN)
```

**`imagePrompt`** — prompt tạo ảnh AI cho scene đó
- Chỉ mô tả **nội dung** (chủ thể, hành động, bối cảnh) — **không viết style**.
- Viết trên đúng **1 dòng duy nhất**, thật chuyên nghiệp, minh hoạ sát nội dung
  kịch bản của scene đó.
- Phong cách **"A colorful, 3D embossed hand-painting style with raised
  textures and bold brushstrokes"** + nền tối Obsidian + màu nhấn thương hiệu
  được tự động thêm vào bởi `STYLE_SUFFIX` trong `scripts/gen_veo3_prompts.py`
  khi sinh prompt VEO3 (xem bảng màu chuẩn ở
  [`Du-lieu-lam-video/thuong-hieu-LDN.txt`](Du-lieu-lam-video/thuong-hieu-LDN.txt)).
- Ví dụ cách viết:
  ```
  "Vietnamese man lying in bed at midnight staring at ceiling, dark bedroom"
  ```
  KHÔNG viết: `"...photorealistic 4K cinematic lighting..."` — phần style đã có sẵn.
- Ảnh sinh ra ở khung dọc **1080×1920 (9:16)** — mô tả bố cục theo chiều dọc
  (chủ thể ở giữa/trên khung, chừa khoảng trống trên-dưới cho text overlay).

---

### Bước 4–6 — Chờ tài nguyên → âm thanh → tính thời gian

**Bước 4 — chờ đủ tài nguyên**: người dùng tự tạo giọng đọc và ảnh/video nền
rồi gửi trực tiếp (không dùng API key). Đặt file đúng tên/vị trí:
- Giọng đọc → `public/voice/scene-NN.mp3` (1 file/scene, khớp `id` trong `data.ts`)
- Ảnh/video nền → `public/images/bg/bg-NN.jpg` (1 file/scene, khớp `id` trong `data.ts`)

**Chưa đủ toàn bộ file voice + bg của mọi scene thì chưa qua bước tiếp theo.**

```bash
# Bước 5 — tạo nhạc nền + hiệu ứng âm thanh (không cần API key)
python -X utf8 scripts/generate_audio.py    # → public/background-music.wav
python -X utf8 scripts/generate_sfx2.py     # → public/sfx/sfx_*.wav

# Bước 6 — tính mốc thời gian thật để viết EFFECTS/SFX_TIMELINE
python -X utf8 scripts/calc_scene_timing.py
```

Dùng output của `calc_scene_timing.py` để viết `EFFECTS` (`src/Effects.tsx`,
startSec tuyệt đối) và `SFX_TIMELINE` (`src/RankingVideo.tsx`).

### Bước 8 — Xem & hoàn thiện

```bash
npm start                                   # Preview: http://localhost:3000
```

Chỉnh sửa `EFFECTS`/`SFX_TIMELINE`/Ken Burns qua lại đến khi người dùng
**xác nhận OK lần 2**. Thời lượng composition được Remotion tự tính
(`calculateMetadata` đọc thời lượng thật từng `public/voice/scene-NN.mp3`)
— không cần đo/ghi tay.

### Bước 9 — Render (chỉ sau khi đã xác nhận OK ở Bước 8)

```bash
npx remotion render src/index.ts MyVideo out/video.mp4 --codec=h264 --crf=18
```

---

### Giọng đọc — tham khảo giọng chuẩn kênh

Giọng đọc do người dùng tự tạo (không dùng API key/script tự động — xem Bước
4). Nếu tự tạo qua Vbee TTS hoặc công cụ tương đương, dùng đúng giọng chuẩn
kênh LDN để nhất quán:

**Giọng hiện dùng**: `n_yenbai_male_giongnamldn_zero_shot_story_vc`

Các giọng Nam khác (tuỳ chọn thay thế):
```
sg_male_minhhoang_full_48k-fhg   — SG Minh Hoàng (trầm ấm)
sg_male_chidat_ebook_48k-phg     — SG Chí Đạt (kể chuyện)
hn_male_thanhlong_talk_48k-fhg   — HN Thanh Long (talk show)
hn_male_manhdung_news_48k-fhg    — HN Mạnh Dũng (tin tức, rõ ràng)
```

---

### Video nền (Google Studio VEO 3) — tuỳ chọn thay ảnh tĩnh

Script `gen_veo3_prompts.py` tự tính số clip 8s cần thiết CHO TỪNG SCENE (dựa
trên độ dài `text` của scene đó).

**Chuẩn viết prompt VEO3** — mỗi prompt (dù do `gen_veo3_prompts.py` sinh ra
hay do Claude viết tay/tinh chỉnh lại) phải:
- **Viết trên đúng 1 dòng duy nhất** — không xuống dòng giữa prompt
- **Thật chuyên nghiệp, đầy đủ chi tiết** — mô tả rõ chủ thể, hành động, bối
  cảnh, ánh sáng riêng cho từng clip, không viết chung chung
- **Minh hoạ thật sát nội dung kịch bản** — nội dung/hành động/bối cảnh mô tả
  trong prompt phải khớp đúng ý của đoạn kịch bản (đoạn `text`) thuộc scene đó,
  không lấy hình ảnh chung chung không liên quan
- **Kỹ thuật, đầy đủ góc quay camera** — nêu rõ chuyển động/góc máy cụ thể
  cho từng clip (vd: "camera slowly pushes in toward the face", "gentle
  parallax drift left", "slow crane tilt down", "graceful arc right"...)
- **Luôn gắn đúng video style, nguyên văn**:
  `A colorful, 3D embossed hand-painting style with raised textures and bold brushstrokes.`
  — kèm nền tối Obsidian `#0A0A0F` + màu nhấn thương hiệu, vertical **9:16**
  portrait framing, kèm `no text, no subtitles`

**Dùng output:**
1. Mở [studio.google.com/flow](https://studio.google.com/flow) → chọn VEO 3, tỉ lệ khung hình **9:16**
2. Copy từng prompt trong `Du-lieu-lam-video/veo3_prompts.txt` → tạo clip 8s
3. Dùng **Character reference** từ clip đầu mỗi scene để đồng bộ nhân vật
4. Ghép các clip của 1 scene lại = video nền cho scene đó (thay cho
   `public/images/bg/bg-NN.jpg` của scene đó)

**Ảnh tĩnh** (mặc định): đặt vào `public/images/bg/bg-00.jpg`, `bg-01.jpg`, ...
(khung dọc 1080×1920, phong cách "A colorful, 3D embossed hand-painting style
with raised textures and bold brushstrokes", 1 ảnh/scene,
tên file khớp `id` của scene trong `data.ts` — scene đầu tiên nên đặt `id: 0`)

---

## Cấu trúc

```
src/
  data.ts             ← CHỈNH Ở ĐÂY khi làm video mới (VIDEO_CONFIG + SCENES)
  index.ts
  Root.tsx            ← Composition + calculateMetadata
  calculateMetadata.ts← tự tính durationInFrames + sceneTimings từ audio thật
  RankingVideo.tsx     ← ghép audio theo scene + SFX_TIMELINE (điền tay)
  Scenes.tsx          ← ảnh/video nền theo sceneTimings + Ken Burns
  Effects.tsx         ← EFFECTS array (6 loại hiệu ứng, điền tay theo scene)

scripts/
  _data.py              ← đọc data.ts (get_scenes, get_video_config, ...)
  calc_scene_timing.py  ← đo thời lượng thật từng scene (ffprobe)
  generate_audio.py     ← nhạc nền ambient (1 file cho cả video)
  generate_sfx2.py      ← SFX cinematic
  gen_veo3_prompts.py   ← prompts cho Google VEO 3 (theo từng scene)

public/
  voice/                ← scene-00.mp3, scene-01.mp3, ... (1 file/scene)
  background-music.wav  ← nhạc nền
  sfx/                  ← SFX files
  images/bg/            ← bg-00.jpg, bg-01.jpg, ... (1080×1920, colorful 3D embossed hand-painting, 1 ảnh/scene)

Du-lieu-lam-video/
  thuong-hieu-LDN.txt              ← hồ sơ thương hiệu (màu, style ảnh) — KHÔNG xoá
  ho-so-cac-mau-hieu-ung-text.txt  ← hồ sơ hiệu ứng text — KHÔNG xoá
  ho-so-cac-mau-hieu-ung-icon-3d.txt ← hồ sơ hiệu ứng icon 3D — KHÔNG xoá
  HO-SO-VIET-KICH-BAN.txt         ← hồ sơ viết kịch bản (hook, kết, văn phong) — KHÔNG xoá
  gioi-thieu-template.txt         ← tổng quan template & tiêu chuẩn kỹ thuật — KHÔNG xoá
  KB-<tên-video>.txt               ← Claude tạo ở Bước 3 (phân đoạn giọng đọc
                                       + prompt hình ảnh/video) — xoá được, tạo lại mỗi video
  veo3_prompts.txt                 ← sinh bởi gen_veo3_prompts.py (xoá được, tạo lại mỗi video)
```

---

## Bảng màu

> Nguồn sự thật duy nhất cho màu sắc & phong cách hình ảnh:
> [`Du-lieu-lam-video/thuong-hieu-LDN.txt`](Du-lieu-lam-video/thuong-hieu-LDN.txt) — luôn đối chiếu file
> này trước khi chọn `accentColor` trong `data.ts` hoặc viết `imagePrompt`.

| Tên màu | Mã hex | Vai trò |
|---------|--------|---------|
| Obsidian | `#0A0A0F` | Nền chính — video & ảnh AI (chiếm tối thiểu 60% diện tích) |
| Signal Red | `#FF3B30` | Trụ cột 1 — Tư tưởng & Hành vi |
| Nature Green | `#30D158` | Trụ cột 2 — Thiên nhiên & Khoa học |
| Mind Purple | `#BF5AF2` | Trụ cột tâm linh / tư tưởng (dùng cho `accentColor` tâm lý học) |
| Data Yellow | `#FFD60A` | Màu nhấn phụ — số liệu, thống kê, counter |
| Ivory White | `#F5F5F0` | Chữ chính trên nền tối |
| Muted White | `#8E8E93` | Chữ phụ — caption, chú thích |
| Deep Gray | `#1C1C1E` | Nền phụ / background thứ cấp |

Quy tắc: mỗi video/ảnh chỉ dùng **tối đa 2 màu** (nền Obsidian + 1 màu nhấn theo
đúng trụ cột nội dung của video đó).

Typography (dùng trong code hiện tại — khác font kênh dùng cho thumbnail/kênh
trong `thuong-hieu-LDN.txt`, phần IV): **Arial Black** (headline) ·
*Segoe UI Italic* (tagline) · Arial (body)

---

## Lưu ý

- **Chỉ render (`npx remotion render`) sau khi đã xem qua `npm start` và
  người dùng xác nhận OK** (2 lần xác nhận trong quy trình: 1 lần cho kịch
  bản ở bước 2, 1 lần cho video hoàn thiện ở bước 8, trước khi render ở
  bước 9 — xem "Phân công nhiệm vụ").
- Chạy Python với `python -X utf8` trên Windows
- Giọng đọc và ảnh/video nền do người dùng tự tạo và cung cấp trực tiếp
  (không dùng API key) — đặt file vào `public/voice/scene-NN.mp3` và
  `public/images/bg/bg-NN.jpg` theo đúng `id` của từng scene trong `data.ts`
- Composition (`src/Root.tsx`) cố định **1080×1920** — không đổi sang ngang
- Thời lượng composition tự tính qua `calculateMetadata` (đọc thời lượng thật
  của `public/voice/scene-NN.mp3`) — KHÔNG có `TOTAL_DURATION_FRAMES` để ghi
  tay nữa
- Template đang ở trạng thái **trống** (`SCENES: []`): `EFFECTS`
  (Effects.tsx), `SFX_TIMELINE` (RankingVideo.tsx) đều rỗng — điền lại sau
  Bước 6 (dùng output `calc_scene_timing.py`)
