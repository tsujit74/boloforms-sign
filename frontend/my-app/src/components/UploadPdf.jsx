import React from "react";
import { useEditor } from "../context/EditorContext";

export default function UploadPdf() {
  const { setPdfFile, setPdfMeta } = useEditor();

  async function handleFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const buffer = await file.arrayBuffer();
  const safeCopy = buffer.slice(0);

  setPdfFile(safeCopy);
  setPdfMeta(null);
}


  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Document</h3>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFile}
        className="text-sm"
      />
      <div className="text-xs text-gray-500 mt-2">
        Or drag & drop. After uploading, the PDF will render
        and you can place fields.
      </div>
    </div>
  );
}
