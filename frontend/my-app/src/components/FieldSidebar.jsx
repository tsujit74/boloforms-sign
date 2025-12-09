import React from "react";
import { useEditor } from "../context/EditorContext";

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
  const { setFields, pdfMeta } = useEditor();

  function addField(type) {
    if (!pdfMeta) {
      alert("Load a PDF before adding fields");
      return;
    }

    const id = cryptoRandomId();

    setFields((prev) => [
      ...prev,
      {
        id,
        type,
        x: 0.1,
        y: 0.1,
        w: type === "signature" ? 0.3 : 0.2,
        h: type === "signature" ? 0.08 : 0.06,
        page: 1,
      },
    ]);
  }

  return (
    <div className="mt-4 select-none">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Tools</h4>

      <div className="grid gap-2">
        {TOOL_ITEMS.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => addField(type)}
            className="
              flex items-center gap-2 
              px-3 py-2 
              rounded-xl 
              bg-white 
              border border-gray-200 
              shadow-sm
              hover:border-blue-500 hover:bg-blue-50
              transition-all 
              active:scale-[0.97]
              text-gray-700
            "
          >
            <Icon className="w-5 h-5 text-gray-600" />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function cryptoRandomId() {
  return (
    "f_" +
    Math.random().toString(36).substring(2, 10) +
    "_" +
    Date.now().toString(36)
  );
}
