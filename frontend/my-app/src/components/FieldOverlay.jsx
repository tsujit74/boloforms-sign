import { Rnd } from "react-rnd";

export default function FieldOverlay({ field, updateField }) {
  return (
    <Rnd
      size={{ width: field.width, height: field.height }}
      position={{ x: field.left, y: field.top }}
      onDragStop={(e, d) => updateField(field.id, { left: d.x, top: d.y })}
      onResizeStop={(e, direction, ref, delta, pos) => {
        updateField(field.id, {
          width: ref.offsetWidth,
          height: ref.offsetHeight,
          left: pos.x,
          top: pos.y,
        });
      }}
      style={{
        border: "2px solid #007bff",
        background: "rgba(0,123,255,0.2)",
        zIndex: 9999,
      }}
    >
      {field.type}
    </Rnd>
  );
}
