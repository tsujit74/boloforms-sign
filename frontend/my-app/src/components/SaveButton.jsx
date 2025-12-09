import React, { useState } from "react";
import { useEditor } from "../context/EditorContext";
import { buildBackendFields, arrayBufferToBase64 } from "../utils/pdfUtils";
import axios from "axios";

export default function SaveButton() {
  const { fields, pdfMeta, pdfFile } = useEditor();
  const [loading, setLoading] = useState(false);

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

    setLoading(true); // START LOADING

    try {
      const pdfBase64 = arrayBufferToBase64(pdfFile);
      const payloadFields = buildBackendFields(fields, pdfMeta);

      const payload = {
        pdfBase64,
        fields: payloadFields,
      };

      console.log("Sending payload:", payload);

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

    setLoading(false); // STOP LOADING
  }

  return (
    <button
      onClick={loading ? null : handleSave}
      className="px-4 py-2 rounded bg-green-600 text-white flex items-center gap-2 disabled:opacity-60"
      disabled={loading}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      )}
      {loading ? "Saving..." : "Save & Sign"}
    </button>
  );
}
