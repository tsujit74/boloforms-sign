import React, { useRef, useState } from "react";
import { useEditor } from "../context/EditorContext";

export default function UploadPdf() {
  const { setPdfFile, setPdfMeta } = useEditor();
  const inputRef = useRef(null);

  const [dragging, setDragging] = useState(false);

  async function handleFileSelect(file) {
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const safeCopy = buffer.slice(0);

    setPdfFile(safeCopy);
    setPdfMeta(null);
  }

  async function handleInput(e) {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700">Upload PDF</h3>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all
          ${
            dragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white/60 backdrop-blur"
          }
        `}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleInput}
          ref={inputRef}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-blue-500 opacity-80"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path d="M12 16V4m0 0L8 8m4-4 4 4m3 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8" />
          </svg>

          <p className="text-sm text-gray-600">
            <span className="font-semibold text-blue-600">Click to upload</span>{" "}
            or drag & drop
          </p>

          <p className="text-xs text-gray-400">PDF files only</p>
        </div>
      </div>
    </div>
  );
}
