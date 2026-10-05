const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { sha256 } = require("../utils/hash");
const PdfDocumentModel = require("../models/PdfDocument");

const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_FIELDS = 500;
const INK = rgb(0, 0, 0);

function parseDataUrl(dataUrl) {
  if (typeof dataUrl !== "string") return null;
  const m = dataUrl.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
  if (!m) return null;
  return { mime: m[1].toLowerCase(), buffer: Buffer.from(m[2], "base64") };
}

async function embedImage(pdfDoc, dataUrl) {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed || parsed.buffer.length === 0) return null;

  const isJpeg = parsed.mime.includes("jpeg") || parsed.mime.includes("jpg");
  const first = isJpeg ? "embedJpg" : "embedPng";
  const second = isJpeg ? "embedPng" : "embedJpg";

  try {
    return await pdfDoc[first](parsed.buffer);
  } catch {
    try {
      return await pdfDoc[second](parsed.buffer);
    } catch {
      return null;
    }
  }
}

function getBox(f) {
  const p = f.pdfPoints;
  if (!p) return null;
  const { x, y, w, h } = p;
  if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return null;
  return { x, y, w, h };
}

function drawImageContain(page, img, box) {
  const { width: imgW, height: imgH } = img.scale(1);
  const scale = Math.min(box.w / imgW, box.h / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;

  page.drawImage(img, {
    x: box.x + (box.w - drawW) / 2,
    y: box.y + (box.h - drawH) / 2,
    width: drawW,
    height: drawH,
  });
}

function formatDate(value, format = "DD/MM/YYYY") {
  const m = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;

  const [, yyyy, mm, dd] = m;
  const d = new Date(Date.UTC(+yyyy, +mm - 1, +dd));
  if (
    d.getUTCFullYear() !== +yyyy ||
    d.getUTCMonth() !== +mm - 1 ||
    d.getUTCDate() !== +dd
  ) {
    return null;
  }

  return format.replace("YYYY", yyyy).replace("MM", mm).replace("DD", dd);
}

function safeText(font, text) {
  const clean = String(text).replace(/[\r\n\t]+/g, " ");
  try {
    font.widthOfTextAtSize(clean, 12);
    return clean;
  } catch {
    return clean
      .split("")
      .map((ch) => {
        try {
          font.widthOfTextAtSize(ch, 12);
          return ch;
        } catch {
          return "?";
        }
      })
      .join("");
  }
}

function drawTextInBox(page, font, rawText, box) {
  const text = safeText(font, rawText);
  if (!text.trim()) return;

  let size = Math.max(6, Math.min(24, Math.floor(box.h * 0.7)));
  const maxWidth = box.w - 4;

  while (size > 6 && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 0.5;
  }

  const textHeight = font.heightAtSize(size, { descender: false });

  page.drawText(text, {
    x: box.x + 2,
    y: box.y + (box.h - textHeight) / 2,
    size,
    font,
    color: INK,
    maxWidth,
  });
}

function drawCheckbox(page, box, checked) {
  const side = Math.min(box.w, box.h);
  const x = box.x + (box.w - side) / 2;
  const y = box.y + (box.h - side) / 2;

  page.drawRectangle({
    x,
    y,
    width: side,
    height: side,
    borderColor: INK,
    borderWidth: 1,
  });

  if (checked) {
    const t = Math.max(1.2, side * 0.1);
    page.drawLine({
      start: { x: x + side * 0.2, y: y + side * 0.5 },
      end: { x: x + side * 0.42, y: y + side * 0.25 },
      thickness: t,
      color: INK,
    });
    page.drawLine({
      start: { x: x + side * 0.42, y: y + side * 0.25 },
      end: { x: x + side * 0.82, y: y + side * 0.78 },
      thickness: t,
      color: INK,
    });
  }
}

function drawRadio(page, box, checked) {
  const d = Math.min(box.w, box.h);
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;

  page.drawCircle({
    x: cx,
    y: cy,
    size: d / 2,
    borderColor: INK,
    borderWidth: 1,
  });

  if (checked) {
    page.drawCircle({ x: cx, y: cy, size: d * 0.22, color: INK });
  }
}

async function signPdf(req, res) {
  try {
    const { pdfBase64, pdfId, fields } = req.body;

    if (!pdfBase64 && !pdfId) {
      return res.status(400).json({ error: "Provide pdfBase64 or pdfId" });
    }
    if (!Array.isArray(fields)) {
      return res.status(400).json({ error: "fields must be an array" });
    }
    if (fields.length > MAX_FIELDS) {
      return res
        .status(400)
        .json({ error: `Too many fields (max ${MAX_FIELDS})` });
    }

    let originalBuffer;
    if (pdfBase64) {
      const matches = pdfBase64.match(/^data:application\/pdf;base64,(.*)$/);
      originalBuffer = Buffer.from(matches ? matches[1] : pdfBase64, "base64");
    } else {
      const filePath = path.join(UPLOAD_DIR, path.basename(String(pdfId)));
      try {
        originalBuffer = await fsp.readFile(filePath);
      } catch {
        return res.status(404).json({ error: "PDF not found" });
      }
    }

    const originalHash = sha256(originalBuffer);

    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(originalBuffer);
    } catch {
      return res.status(400).json({ error: "Invalid or encrypted PDF" });
    }

    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const f of fields) {
      try {
        const page = pages[Math.max(0, (f.page || 1) - 1)];
        const box = getBox(f);
        if (!page || !box) continue;

        const meta = f.meta || {};

        switch (f.type) {
          case "signature": {
            if (!meta.signatureBase64) break;
            const img = await embedImage(pdfDoc, meta.signatureBase64);
            if (img) drawImageContain(page, img, box);
            break;
          }

          case "image": {
            if (!meta.imageBase64) break;
            const img = await embedImage(pdfDoc, meta.imageBase64);
            if (img) drawImageContain(page, img, box);
            break;
          }

          case "text": {
            if (meta.text) drawTextInBox(page, font, meta.text, box);
            break;
          }

          case "date": {
            const formatted = formatDate(
              meta.date,
              meta.dateFormat || "DD/MM/YYYY",
            );
            if (formatted) drawTextInBox(page, font, formatted, box);
            break;
          }

          case "checkbox": {
            drawCheckbox(page, box, !!meta.checked);
            break;
          }

          case "radio": {
            drawRadio(page, box, !!meta.checked);
            break;
          }

          default:
            break;
        }
      } catch (fieldErr) {
        console.warn(`Skipped field ${f?.id} (${f?.type}):`, fieldErr.message);
      }
    }

    const finalPdfBytes = Buffer.from(await pdfDoc.save());
    const signedHash = sha256(finalPdfBytes);

    const filename = `signed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.pdf`;
    await fsp.writeFile(path.join(UPLOAD_DIR, filename), finalPdfBytes);

    const doc = new PdfDocumentModel({
      pdfId: pdfId || filename,
      originalPdfPath: null,
      signedPdfPath: filename,
      originalHash,
      signedHash,
      fields,
    });
    await doc.save();

    const fileUrl = `${process.env.BASE_URL || "http://localhost:4000"}/files/${filename}`;
    res.json({ url: fileUrl, docId: doc._id });
  } catch (err) {
    console.error("signPdf error:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
}

module.exports = { signPdf };
