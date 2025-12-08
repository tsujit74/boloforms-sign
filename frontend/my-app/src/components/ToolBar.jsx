import React from "react";
import { useEditor } from "../context/EditorContext";

export default function Toolbar() {
  const { pdfMeta, zoom, setZoom, setPdfMeta } = useEditor();
  if (!pdfMeta) return null;

  function zoomIn() {
    setZoom((z) => Math.min(3, z + 0.25));
  }
  function zoomOut() {
    setZoom((z) => Math.max(0.5, z - 0.25));
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button onClick={zoomOut} className="px-3 py-1 bg-white rounded shadow-sm">
          −
        </button>
        <button onClick={zoomIn} className="px-3 py-1 bg-white rounded shadow-sm">
          +
        </button>
        <div className="text-sm text-gray-600 ml-2">Zoom: {(zoom * 100).toFixed(0)}%</div>
      </div>

      <div className="text-sm text-gray-500">PDF Editor — Responsive Placement</div>
    </div>
  );
}
