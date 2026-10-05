export const SIGNATURE_FONTS = [
  { id: "dancing", label: "Dancing Script", family: '"Dancing Script", cursive' },
  { id: "vibes", label: "Great Vibes", family: '"Great Vibes", cursive' },
  { id: "caveat", label: "Caveat", family: '"Caveat", cursive' },
];

const CANVAS_H = 160;
const FONT_SIZE = 96;
const PAD = 24;

export async function loadSignatureFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await Promise.all(
      SIGNATURE_FONTS.map((f) => document.fonts.load(`${FONT_SIZE}px ${f.family}`))
    );
  } catch {
    return;
  }
}

export function renderTypedSignature(text, fontFamily, color = "#111111") {
  const clean = String(text || "").trim().slice(0, 40);
  if (!clean) return null;

  const measure = document.createElement("canvas").getContext("2d");
  measure.font = `${FONT_SIZE}px ${fontFamily}`;
  const textWidth = Math.ceil(measure.measureText(clean).width);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(120, textWidth + PAD * 2);
  canvas.height = CANVAS_H;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${FONT_SIZE}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(clean, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL("image/png");
}