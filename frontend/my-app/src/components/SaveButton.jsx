import React, { useState } from "react";
import { useEditor } from "../context/EditorContext";
import { buildBackendFields, arrayBufferToBase64 } from "../utils/pdfUtils";
import axios from "axios";
import { CheckCircle, Loader2 } from "lucide-react";

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

    setLoading(true);

    try {
      const pdfBase64 = arrayBufferToBase64(pdfFile);
      const payloadFields = buildBackendFields(fields, pdfMeta);

      const payload = { pdfBase64, fields: payloadFields };

      const res = await axios.post(`${API}/api/sign-pdf`, payload);

      if (res.data.url) {
        window.open(res.data.url, "_blank");
      } else {
        alert("Signed but no URL returned");
      }
    } catch (err) {
      console.error("Sign error:", err);
      alert("Failed to sign PDF. Check console.");
    }

    setLoading(false);
  }

  return (
    <button
      onClick={loading ? null : handleSave}
      disabled={loading}
      className="px-2 py-1.5 
        bg-gray-500 
        text-white 
        flex items-center gap-2 
        transition-all 
        active:scale-95 
        hover:bg-gray-700
        disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <CheckCircle className="w-5 h-5" />
      )}

      <span className="text-sm font-medium">
        {loading ? "Saving & Signing..." : "Save & Sign"}
      </span>
    </button>
  );
}
