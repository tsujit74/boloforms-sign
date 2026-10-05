export const FIELD_MIME = "application/x-field-type";

export const DEFAULT_SIZE = {
  signature: { w: 0.3, h: 0.08 },
  text: { w: 0.25, h: 0.05 },
  image: { w: 0.25, h: 0.15 },
  date: { w: 0.2, h: 0.05 },
  checkbox: { w: 0.04, h: 0.04 },
  radio: { w: 0.04, h: 0.04 },
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return "f_" + crypto.randomUUID();
  }
  return (
    "f_" +
    Math.random().toString(36).slice(2, 10) +
    "_" +
    Date.now().toString(36)
  );
}

export function createField(type, page, pos, countOnPage = 0) {
  const size = DEFAULT_SIZE[type] || { w: 0.2, h: 0.06 };

  let x;
  let y;

  if (pos) {
    x = clamp(pos.x - size.w / 2, 0, 1 - size.w);
    y = clamp(pos.y - size.h / 2, 0, 1 - size.h);
  } else {
    const offset = (countOnPage % 8) * 0.03;
    x = Math.min(0.1 + offset, 1 - size.w);
    y = Math.min(0.1 + offset, 1 - size.h);
  }

  return {
    id: makeId(),
    type,
    page,
    x,
    y,
    w: size.w,
    h: size.h,
    meta: type === "date" ? { date: todayISO() } : {},
  };
}