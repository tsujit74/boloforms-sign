import React, { useMemo } from "react";
import { useEditor } from "../context/EditorContext";
import DraggableField from "./DraggableField";

export default function FieldLayer() {
  const { fields, pdfMeta } = useEditor();

  const currentPage = pdfMeta?.currentPage || 1;
  const visible = useMemo(
    () => fields.filter((f) => f.page === currentPage),
    [fields, currentPage],
  );

  if (!pdfMeta) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {visible.map((f) => (
        <DraggableField key={f.id} field={f} />
      ))}
    </div>
  );
}
