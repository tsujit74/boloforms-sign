import React from "react";
import { useEditor } from "../context/EditorContext";
import { Trash2 } from "lucide-react";

export default function PropertiesPanel() {
  const { fields, selectedId, setFields } = useEditor();
  const selected = fields.find((f) => f.id === selectedId);

  if (!selected)
    return (
      <div className="text-sm text-gray-400 italic text-center py-6">
        Select a field to edit its properties
      </div>
    );

  function update(changes) {
    setFields((prev) =>
      prev.map((p) => (p.id === selected.id ? { ...p, ...changes } : p))
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-700">Properties</h3>

      {/* Field Type */}
      <Section title="Field Type">
        <div className="text-sm font-medium text-gray-700 capitalize">
          {selected.type}
        </div>
      </Section>

      {/* Page Input */}
      <Section title="Page Number">
        <Input
          type="number"
          value={selected.page}
          onChange={(e) =>
            update({ page: Math.max(1, parseInt(e.target.value || 1)) })
          }
        />
      </Section>

      {/* Position */}
      <Section title="Position (Relative)">
        <div className="grid grid-cols-2 gap-3">
          <Input
            value={selected.x}
            onChange={(e) =>
              update({ x: clamp(parseFloat(e.target.value), 0, 1) })
            }
            placeholder="X"
          />
          <Input
            value={selected.y}
            onChange={(e) =>
              update({ y: clamp(parseFloat(e.target.value), 0, 1) })
            }
            placeholder="Y"
          />
        </div>
      </Section>

      {/* Size */}
      <Section title="Size (Relative)">
        <div className="grid grid-cols-2 gap-3">
          <Input
            value={selected.w}
            onChange={(e) =>
              update({ w: clamp(parseFloat(e.target.value), 0.01, 1) })
            }
            placeholder="Width"
          />
          <Input
            value={selected.h}
            onChange={(e) =>
              update({ h: clamp(parseFloat(e.target.value), 0.01, 1) })
            }
            placeholder="Height"
          />
        </div>
      </Section>

      {/* Only for text fields */}
      {selected.type === "text" && (
        <Section title="Default Text">
          <Input
            value={selected.meta?.defaultText || ""}
            onChange={(e) =>
              update({
                meta: { ...selected.meta, defaultText: e.target.value },
              })
            }
            placeholder="Enter text"
          />
        </Section>
      )}

      {/* Delete Button */}
      <button
        onClick={() =>
          setFields((prev) => prev.filter((p) => p.id !== selected.id))
        }
        className="
          w-full py-2.5 
          bg-red-600 text-white
           shadow-sm 
          hover:bg-red-700 active:scale-95 
          flex items-center justify-center gap-2 
          transition
        "
      >
        <Trash2 size={16} />
        Delete Field
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-500 tracking-wide">
        {title}
      </label>
      {children}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="
        w-full px-3 py-2 
         
        bg-gray-50 border border-gray-200
        text-sm text-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 
        transition
      "
    />
  );
}

function clamp(v, a, b) {
  if (Number.isNaN(v)) return a;
  return Math.max(a, Math.min(b, v));
}
