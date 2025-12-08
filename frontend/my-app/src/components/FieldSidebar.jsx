import React from "react";
import { useEditor } from "../context/EditorContext";

const TOOL_ITEMS = [
  { type: "signature", label: "Signature" },
  { type: "text", label: "Text" },
  { type: "image", label: "Image" },
  { type: "date", label: "Date" },
  { type: "checkbox", label: "Checkbox" },
  { type: "radio", label: "Radio" },
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
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Tools</h4>

      <div className="grid gap-2">
        {TOOL_ITEMS.map((item) => (
          <button
            key={item.type}
            onClick={() => addField(item.type)}
            className="text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition"
          >
            {item.label}
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
