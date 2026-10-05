import React from "react";
import { useEditor } from "../context/EditorContext";
import { createField, FIELD_MIME } from "../utils/fieldDefaults";
import {
  PenLine,
  Image as ImageIcon,
  Calendar,
  CheckSquare,
  Dot,
  PenTool,
} from "lucide-react";

const TOOL_ITEMS = [
  { type: "signature", label: "Signature", icon: PenTool },
  { type: "text", label: "Text", icon: PenLine },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "date", label: "Date", icon: Calendar },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "radio", label: "Radio", icon: Dot },
];

export default function FieldSidebar() {
  const { setFields, pdfMeta, setSelectedId } = useEditor();

  function addField(type) {
    if (!pdfMeta) {
      alert("Load a PDF before adding fields");
      return;
    }

    const page = pdfMeta.currentPage || 1;

    setFields((prev) => {
      const countOnPage = prev.filter((f) => f.page === page).length;
      const field = createField(type, page, null, countOnPage);
      setSelectedId?.(field.id);
      return [...prev, field];
    });
  }

  function onDragStart(e, type) {
    if (!pdfMeta) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData(FIELD_MIME, type);
    e.dataTransfer.effectAllowed = "copy";
  }

  return (
    <div className="mt-4 select-none">
      <h4 className="text-sm font-semibold text-gray-700 mb-1">Tools</h4>
      <p className="text-xs text-gray-500 mb-3">
        Drag onto the page, or tap to add
      </p>

      <div className="grid gap-2">
        {TOOL_ITEMS.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            draggable={!!pdfMeta}
            onDragStart={(e) => onDragStart(e, type)}
            onClick={() => addField(type)}
            disabled={!pdfMeta}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 shadow-sm
                       hover:border-gray-500 hover:bg-gray-50 transition-all active:scale-[0.97]
                       text-gray-700 cursor-grab active:cursor-grabbing
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon className="w-5 h-5 text-gray-600" />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}