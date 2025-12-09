```md
# BoloForms Signature Engine – Full Stack PDF Signer

A full-stack Signature Injection Engine inspired by BoloForms.  
This project allows users to upload a PDF, place fields (text, signature, image, date, checkbox, radio), and burn them permanently into the PDF using a custom backend engine.

🚀 Live Demo: https://boloforms-sign.vercel.app/  
📦 GitHub: https://github.com/tsujit74/boloforms-sign  

---

## ⭐ Features

### ✔ **Frontend (React + Vite)**
- Upload any PDF (A4, Letter, custom sizes)
- Live PDF viewer (pdf.js)
- Multi-page navigation
- Zoom in/out with responsive scaling
- Drag & drop fields:
  - Signature
  - Text input
  - Image upload
  - Date selector
  - Checkbox
  - Radio button
- Real-time field resizing + grid snap
- Signature Pad Modal (draw digital signature)
- Fields are relative (0–1 scale) → perfect placement at any zoom
- Page-wise field placement (field.page stored automatically)
- Fully responsive PDF editing UI
- Data prepared for backend:
  - PDF points
  - Relative coordinates
  - Per-page metadata

---

## 🛠 **Backend (Node.js + Express + pdf-lib + MongoDB)**

### ✔ Signature Injection Engine  
Converts UI field placement → exact PDF coordinate system.

Supports:
- Burn-in text with auto font sizing
- Image insertion
- Signature placement with aspect-ratio fitting
- Checkbox rendering
- Radio button rendering
- Multi-page support
- Per-field PDF positioning using PDF points

### ✔ Audit Trail (SHA-256 Hashing)
Every signed PDF stores:
- Original PDF Hash
- Final Signed PDF Hash
- All field data
- Timestamp  
Stored in MongoDB using a `PdfDocumentModel`.

### ✔ File Storage
All signed PDFs saved into `/uploads` with public access:
```

[http://localhost:4000/files/](http://localhost:4000/files/)<filename>.pdf

```


---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository
```bash
git clone https://github.com/tsujit74/boloforms-sign
cd boloforms-sign
````

---

## 🖥 Backend Setup

### Install dependencies:

```bash
cd backend
npm install
```

### Create `.env`

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/boloforms-sign
BASE_URL=http://localhost:4000
UPLOAD_DIR=uploads
```

### Start backend:

```bash
npm start
```

Backend runs on:

```
http://localhost:4000
```

---

## 🌐 Frontend Setup

### Install dependencies:

```bash
cd frontend
cd my-app
npm install
```

### Start frontend:

```bash
npm run dev
```

Runs at:

```
http://localhost:5173
```

---

## 📌 API Endpoint

### `POST /api/sign-pdf`

#### Payload:

```json
{
  "pdfBase64": "<base64 PDF string>",
  "fields": [
    {
      "id": "fld123",
      "type": "text",
      "page": 1,
      "relative": { "x": 0.1, "y": 0.15, "w": 0.2, "h": 0.05 },
      "pdfPoints": { "x": 59.5, "y": 702.3, "w": 119.0, "h": 42.1 },
      "meta": { "text": "Hello!" }
    }
  ]
}
```

#### Response:

```json
{
  "url": "http://localhost:4000/files/signed_1736532820.pdf",
  "docId": "6782dfcd93..."
}
```

---

## 🧪 Testing the Engine

1. Upload PDF
2. Add fields (signature, text, image, checkbox)
3. Drag & resize anywhere
4. Click **Save & Sign**
5. Signed PDF will open in new tab

---

## 🎯 Key Requirements Completed (From BoloForms PDF)

| Requirement                    | Status |
| ------------------------------ | ------ |
| PDF field placement & dragging | ✅ Done |
| Responsive PDF viewer          | ✅ Done |
| Signature pad                  | ✅ Done |
| Image upload                   | ✅ Done |
| Date, checkbox, radio          | ✅ Done |
| Multi-page PDF support         | ✅ Done |
| PDF points conversion          | ✅ Done |
| Backend burn-in using pdf-lib  | ✅ Done |
| Hash-based audit               | ✅ Done |
| Save PDF to server             | ✅ Done |
| Save metadata to DB            | ✅ Done |

---

## 🏁 Future Enhancements

* Undo/Redo
* Field templates
* Multi-user signing workflow
* Text font selector
* E-signature verification

---

## ✨ Author

**Sujit Thakur**
GitHub: [https://github.com/tsujit74](https://github.com/tsujit74)
Portfolio: [https://sujit-porttfolio.vercel.app](https://sujit-porttfolio.vercel.app)

---
