const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const { sha256 } = require("../utils/hash");
const PdfDocumentModel = require("../models/PdfDocument");

const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

async function signPdf(req, res) {
  try {
    const { pdfBase64, pdfId, fields } = req.body;

    if (!pdfBase64 && !pdfId) {
      return res.status(400).json({ error: "Provide pdfBase64 or pdfId" });
    }

    // load original PDF buffer
    let originalBuffer;
    if (pdfBase64) {
      const matches = pdfBase64.match(/^data:application\/pdf;base64,(.*)$/);
      const base64 = matches ? matches[1] : pdfBase64;
      originalBuffer = Buffer.from(base64, "base64");
    } else {
      const filePath = path.join(UPLOAD_DIR, pdfId);
      originalBuffer = fs.readFileSync(filePath);
    }

    const originalHash = sha256(originalBuffer);
    const pdfDoc = await PDFDocument.load(originalBuffer);

    for (const f of fields) {
      const pageIndex = Math.max(0, (f.page || 1) - 1);
      const pages = pdfDoc.getPages();
      if (!pages[pageIndex]) continue;
      const page = pages[pageIndex];
      if (f.type === "signature" && f.meta?.signatureBase64) {
        const imageBase64 = f.meta.signatureBase64.split(",")[1];
        const sigImage = await pdfDoc
          .embedPng(Buffer.from(imageBase64, "base64"))
          .catch(async () => {
            return pdfDoc.embedJpg(Buffer.from(imageBase64, "base64"));
          });

        const boxW = f.pdfPoints.w;
        const boxH = f.pdfPoints.h;
        const { width: imgW, height: imgH } = sigImage.scale(1);
        const imgAspect = imgW / imgH;
        const boxAspect = boxW / boxH;
        let drawW, drawH;
        if (imgAspect > boxAspect) {
          drawW = boxW;
          drawH = boxW / imgAspect;
        } else {
          drawH = boxH;
          drawW = boxH * imgAspect;
        }
        const offsetX = f.pdfPoints.x + (boxW - drawW) / 2;
        const offsetY = f.pdfPoints.y + (boxH - drawH) / 2;

        page.drawImage(sigImage, {
          x: offsetX,
          y: offsetY,
          width: drawW,
          height: drawH,
        });
      }

      if (f.type === "image" && f.meta?.imageBase64) {
        const imageBase64 = f.meta.imageBase64.split(",")[1];
        const img = await pdfDoc
          .embedJpg(Buffer.from(imageBase64, "base64"))
          .catch(async () => {
            return pdfDoc.embedPng(Buffer.from(imageBase64, "base64"));
          });

        const boxW = f.pdfPoints.w;
        const boxH = f.pdfPoints.h;
        const { width: imgW, height: imgH } = img.scale(1);
        const imgAspect = imgW / imgH;
        const boxAspect = boxW / boxH;
        let drawW, drawH;
        if (imgAspect > boxAspect) {
          drawW = boxW;
          drawH = boxW / imgAspect;
        } else {
          drawH = boxH;
          drawW = boxH * imgAspect;
        }
        const offsetX = f.pdfPoints.x + (boxW - drawW) / 2;
        const offsetY = f.pdfPoints.y + (boxH - drawH) / 2;
        page.drawImage(img, {
          x: offsetX,
          y: offsetY,
          width: drawW,
          height: drawH,
        });
      }

      if (f.type === "text" && f.meta?.text) {
        const { x, y } = f.pdfPoints;
        const fontSize = Math.max(
          8,
          Math.min(24, Math.floor(f.pdfPoints.h * 0.8))
        );
        const helvetica = await pdfDoc
          .embedFont(PDFDocument.PDFName ? undefined : "Helvetica")
          .catch(() => null);

        page.drawText(String(f.meta.text), {
          x: f.pdfPoints.x,
          y: f.pdfPoints.y + (f.pdfPoints.h - fontSize) / 2,
          size: fontSize,
        });
      }

      if (f.type === "checkbox") {
        if (f.meta?.checked) {
          page.drawRectangle({
            x: f.pdfPoints.x + f.pdfPoints.w * 0.15,
            y: f.pdfPoints.y + f.pdfPoints.h * 0.15,
            width: f.pdfPoints.w * 0.7,
            height: f.pdfPoints.h * 0.7,
            color: undefined,
          });
        }
      }
    }

    const finalPdfBytes = await pdfDoc.save();

    const signedHash = sha256(finalPdfBytes);

    const filename = `signed_${Date.now()}.pdf`;
    const outPath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(outPath, finalPdfBytes);

    const doc = new PdfDocumentModel({
      pdfId: pdfId || filename,
      originalPdfPath: null,
      signedPdfPath: filename,
      originalHash,
      signedHash,
      fields,
    });
    await doc.save();

    const fileUrl = `${
      process.env.BASE_URL || "http://localhost:4000"
    }/files/${filename}`;
    res.json({ url: fileUrl, docId: doc._id });
  } catch (err) {
    console.error("signPdf error:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
}

module.exports = { signPdf };
