import React from "react";
import { useEditor } from "../context/EditorContext";
import { ZoomIn, ZoomOut } from "lucide-react";
import SaveButton from "./SaveButton";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const STEP = 0.25;

export default function Toolbar() {
  const { pdfMeta, zoom, setZoom } = useEditor();
  if (!pdfMeta) return null;

  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, z + STEP));
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z - STEP));
  const resetZoom = () => setZoom(1);

  return (
    <div className="w-full flex items-center justify-between gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm">
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Zoom out"
          className="p-3 sm:p-2 bg-gray-100 hover:bg-gray-200 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ZoomOut size={18} />
        </button>

        <button
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Zoom in"
          className="p-3 sm:p-2 bg-gray-100 hover:bg-gray-200 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ZoomIn size={18} />
        </button>

        <button
          onClick={resetZoom}
          aria-label="Reset zoom"
          className="min-w-[3.25rem] text-sm font-medium text-gray-700 px-2 sm:px-3 py-3 sm:py-2 bg-gray-100 hover:bg-gray-200 transition"
        >
          {Math.round(zoom * 100)}%
        </button>
      </div>

      <div className="hidden md:block text-sm font-semibold text-gray-600 tracking-wide truncate">
        PDF Editor
      </div>

      <div className="shrink-0">
        <SaveButton />
      </div>
    </div>
  );
}