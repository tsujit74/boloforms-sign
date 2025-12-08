const mongoose = require("mongoose");

const FieldSchema = new mongoose.Schema({
  id: String,
  type: String,
  page: Number,
  x: Number, y: Number, w: Number, h: Number, 
  pdfX: Number, pdfY: Number, pdfW: Number, pdfH: Number,
  meta: mongoose.Schema.Types.Mixed
});

const PdfDocumentSchema = new mongoose.Schema({
  pdfId: { type: String, required: true },
  originalPdfPath: { type: String },
  signedPdfPath: { type: String },
  originalHash: { type: String },
  signedHash: { type: String },
  fields: [FieldSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PdfDocument", PdfDocumentSchema);
