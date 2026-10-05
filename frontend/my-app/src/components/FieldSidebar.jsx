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

const DEFAULT_SIZE = {
  signature: { w: 0.3, h: 0.08 },
  text: { w: 0.25, h: 0.05 },
  image: { w: 0.25, h: 0.15 },
  date: { w: 0.2, h: 0.05 },
  checkbox: { w: 0.04, h: 0.04 },
  radio: { w: 0.04, h: 0.04 },
};

export default function FieldSidebar() {
  const { setFields, pdfMeta, setSelectedId } = useEditor();

  function addField(type) {
    if (!pdfMeta) {
      alert("Load a PDF before adding fields");
      return;
    }

    const page = pdfMeta.currentPage || 1;
    const id = makeId();
    const size = DEFAULT_SIZE[type] || { w: 0.2, h: 0.06 };

    setFields((prev) => {
      const countOnPage = prev.filter((f) => f.page === page).length;
      const offset = (countOnPage % 8) * 0.03;

      return [
        ...prev,
        {
          id,
          type,
          page,
          x: Math.min(0.1 + offset, 1 - size.w),
          y: Math.min(0.1 + offset, 1 - size.h),
          w: size.w,
          h: size.h,
          meta: type === "date" ? { date: todayISO() } : {},
        },
      ];
    });

    setSelectedId?.(id);
  }

  return (
    <div className="mt-4 select-none">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Tools</h4>

      <div className="grid gap-2">
        {TOOL_ITEMS.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => addField(type)}
            disabled={!pdfMeta}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 shadow-sm
                       hover:border-gray-500 hover:bg-gray-50 transition-all active:scale-[0.97]
                       text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon className="w-5 h-5 text-gray-600" />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return "f_" + crypto.randomUUID();
  }
  return (
    "f_" +
    Math.random().toString(36).slice(2, 10) +
    "_" +
    Date.now().toString(36)
  );
}
