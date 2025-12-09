import React from "react";
import { useEditor } from "../context/EditorContext";
import { buildBackendFields, arrayBufferToBase64 } from "../utils/pdfUtils";
import axios from "axios";

export default function SaveButton() {
  const { fields, pdfMeta, pdfFile } = useEditor();

  const API = import.meta.env.VITE_BACKEND_URL;

  async function handleSave() {
    if (!pdfMeta || !pdfFile) {
      alert("Load PDF first");
      return;
    }

    if (!(pdfFile instanceof ArrayBuffer) || pdfFile.byteLength === 0) {
      alert("PDF buffer invalid or empty. Upload again.");
      return;
    }

    
    const pdfBase64 = arrayBufferToBase64(pdfFile);
    const payloadFields = buildBackendFields(fields, pdfMeta);

    const payload = {
      pdfBase64,
      fields: payloadFields,
    };

    console.log("Sending payload:", payload);

    try {
      const res = await axios.post(`${API}/api/sign-pdf`, payload);

      console.log("Signed PDF:", res.data);

      if (res.data.url) {
        window.open(res.data.url, "_blank");
      } else {
        alert("Signed but no URL returned");
      }
    } catch (err) {
      console.error("Sign error:", err);
      alert("Failed to sign PDF. Check console.");
    }
  }

  return (
    <button
      onClick={handleSave}
      className="px-4 py-2 rounded bg-green-600 text-white"
    >
      Save & Sign
    </button>
  );
}
