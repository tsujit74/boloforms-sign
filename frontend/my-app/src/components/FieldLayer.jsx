import React from "react";
import { useEditor } from "../context/EditorContext";
import DraggableField from "./DraggableField";

export default function FieldLayer() {
  const { fields, pdfMeta } = useEditor();
  if (!pdfMeta) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {fields
        .filter((f) => f.page === (pdfMeta.currentPage || 1))
        .map((f) => (
          <DraggableField key={f.id} field={f} />
        ))}
    </div>
  );
}
