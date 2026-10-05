const KEY = "forms-sign:saved-signature";

export function saveSignature(dataUrl) {
  try {
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) return;
    localStorage.setItem(KEY, dataUrl);
  } catch {
    return;
  }
}

export function loadSignature() {
  try {
    const value = localStorage.getItem(KEY);
    if (typeof value === "string" && value.startsWith("data:image/")) return value;
    return null;
  } catch {
    return null;
  }
}

export function clearSignature() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    return;
  }
}