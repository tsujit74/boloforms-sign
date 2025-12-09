import React from "react";
import { useEditor } from "../context/EditorContext";
import { Minus, Plus, ZoomIn, ZoomOut } from "lucide-react";
import SaveButton from "./SaveButton";

export default function Toolbar() {
  const { pdfMeta, zoom, setZoom } = useEditor();
  if (!pdfMeta) return null;

  const zoomIn = () => setZoom((z) => Math.min(3, z + 0.25));
  const zoomOut = () => setZoom((z) => Math.max(0.5, z - 0.25));

  return (
    <div className="
      w-full 
      flex items-center justify-between 
      px-3 py-1 
      bg-white/70 backdrop-blur-sm 
      border border-gray-200 
      rounded-xl shadow-sm
    ">
      
      <div className="flex items-center gap-3">

        <button
          onClick={zoomOut}
          className="
            p-1 rounded-lg bg-gray-100 
            hover:bg-gray-200 
            active:scale-95 
            transition
          "
        >
          <ZoomOut size={18} />
        </button>

        <button
          onClick={zoomIn}
          className="
            p-1 rounded-lg bg-gray-100 
            hover:bg-gray-200 
            active:scale-95 
            transition
          "
        >
          <ZoomIn size={18} />
        </button>

        <div className="text-sm font-medium text-gray-700 px-3 py-1 bg-gray-100 rounded-lg">
          {(zoom * 100).toFixed(0)}%
        </div>
      </div>

      <div className="text-sm font-semibold text-gray-600 tracking-wide">
        PDF Editor
      </div>

     
      <div className="text-xs text-gray-400 pr-1">
        <div className="flex justify-end">
          <SaveButton />
        </div>
      </div>

    </div>
  );
}
