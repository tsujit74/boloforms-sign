import React from "react";
import { useEditor } from "../context/EditorContext";

export default function PropertiesPanel() {
  const { fields, selectedId, setFields } = useEditor();
  const selected = fields.find((f) => f.id === selectedId);

  if (!selected)
    return <div className="text-sm text-gray-500">Select a field to edit its properties</div>;

  function update(changes) {
    setFields((prev) => prev.map((p) => (p.id === selected.id ? { ...p, ...changes } : p)));
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold">Properties</h4>

      <div>
        <label className="block text-xs text-gray-500">Type</label>
        <div className="text-sm py-2">{selected.type}</div>
      </div>

      <div>
        <label className="block text-xs text-gray-500">Page</label>
        <input
          type="number"
          value={selected.page}
          onChange={(e) => update({ page: Math.max(1, parseInt(e.target.value || 1)) })}
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500">Position (relative)</label>
        <div className="flex gap-2">
          <input value={selected.x} onChange={(e) => update({ x: clamp(parseFloat(e.target.value), 0, 1) })} className="border px-2 py-1 rounded w-full" />
          <input value={selected.y} onChange={(e) => update({ y: clamp(parseFloat(e.target.value), 0, 1) })} className="border px-2 py-1 rounded w-full" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500">Size (relative)</label>
        <div className="flex gap-2">
          <input value={selected.w} onChange={(e) => update({ w: clamp(parseFloat(e.target.value), 0.01, 1) })} className="border px-2 py-1 rounded w-full" />
          <input value={selected.h} onChange={(e) => update({ h: clamp(parseFloat(e.target.value), 0.01, 1) })} className="border px-2 py-1 rounded w-full" />
        </div>
      </div>

      {/* Example type-specific meta */}
      {selected.type === "text" && (
        <div>
          <label className="block text-xs text-gray-500">Default Text</label>
          <input value={selected.meta?.defaultText || ""} onChange={(e) => update({ meta: { ...selected.meta, defaultText: e.target.value } })} className="border px-2 py-1 rounded w-full" />
        </div>
      )}

      <div>
        <button onClick={() => setFields((prev) => prev.filter((p) => p.id !== selected.id))} className="w-full py-2 bg-red-500 text-white rounded">Delete Field</button>
      </div>
    </div>
  );
}

function clamp(v, a, b) {
  if (Number.isNaN(v)) return a;
  return Math.max(a, Math.min(b, v));
}
