import React, { useRef, useEffect, useState } from "react";
import { useEditor } from "../context/EditorContext";
import SignaturePadModal from "../components/SignaturePadModel";
import { pixelsToRelative, relativeToPixels } from "../utils/pdfUtils";

function snapToGrid(px, grid = 4) {
  return Math.round(px / grid) * grid;
}

export default function DraggableField({ field }) {
  const { pdfMeta, fields, setFields, selectedId, setSelectedId } = useEditor();
  const elRef = useRef(null);

  // Signature Pad
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  const [local, setLocal] = useState({
    x: field.x,
    y: field.y,
    w: field.w,
    h: field.h,
  });

  const localRef = useRef(local);
  useEffect(() => {
    localRef.current = local;
  }, [local]);

  useEffect(() => {
    setLocal({ x: field.x, y: field.y, w: field.w, h: field.h });
  }, [field]);

  if (!pdfMeta) return null;

  const PDF_W = pdfMeta.width;
  const PDF_H = pdfMeta.height;

  const px = relativeToPixels(local, PDF_W, PDF_H);

  const style = {
    position: "absolute",
    left: `${px.left}px`,
    top: `${px.top}px`,
    width: `${px.width}px`,
    height: `${px.height}px`,
    background: "white",
    pointerEvents: "auto",
    zIndex: selectedId === field.id ? 9999 : 500,
    border: "2px dashed #3b82f6",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  function startDrag(e) {
    e.stopPropagation();
    setSelectedId(field.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = px.left;
    const startTop = px.top;

    function onMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      let nx = snapToGrid(startLeft + dx);
      let ny = snapToGrid(startTop + dy);

      nx = Math.max(0, Math.min(PDF_W - px.width, nx));
      ny = Math.max(0, Math.min(PDF_H - px.height, ny));

      const rel = pixelsToRelative(
        {
          left: nx,
          top: ny,
          width: px.width,
          height: px.height,
        },
        PDF_W,
        PDF_H
      );

      setLocal(rel);
      localRef.current = rel;
    }

    function onUp() {
      setFields((prev) =>
        prev.map((p) => (p.id === field.id ? { ...p, ...localRef.current } : p))
      );
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function startResize(e) {
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = px.width;
    const startH = px.height;

    function onMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      let nw = snapToGrid(startW + dx);
      let nh = snapToGrid(startH + dy);

      nw = Math.max(20, Math.min(PDF_W - px.left, nw));
      nh = Math.max(20, Math.min(PDF_H - px.top, nh));

      const rel = pixelsToRelative(
        {
          left: px.left,
          top: px.top,
          width: nw,
          height: nh,
        },
        PDF_W,
        PDF_H
      );

      setLocal(rel);
      localRef.current = rel;
    }

    function onUp() {
      setFields((prev) =>
        prev.map((p) => (p.id === field.id ? { ...p, ...localRef.current } : p))
      );
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function updateMeta(changes) {
    setFields((prev) =>
      prev.map((p) =>
        p.id === field.id ? { ...p, meta: { ...p.meta, ...changes } } : p
      )
    );
  }

  function uploadSignature() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const base64 = await toBase64(file);
      updateMeta({ signatureBase64: base64 });
    };
    input.click();
  }

  function uploadImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const base64 = await toBase64(file);
      updateMeta({ imageBase64: base64 });
    };
    input.click();
  }

  function toBase64(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  const renderFieldContent = () => {
    const meta = field.meta || {};

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={meta.text || ""}
            placeholder="Type..."
            onChange={(e) => updateMeta({ text: e.target.value })}
            className="w-full h-full text-xs p-1 outline-none bg-transparent"
          />
        );

      case "signature":
        if (meta.signatureBase64) {
          return (
            <img
              src={meta.signatureBase64}
              className="w-full h-full object-contain"
            />
          );
        }

        return (
          <div className="flex flex-col items-center text-xs text-blue-600 gap-1">
            <button onClick={() => setShowSignaturePad(true)}>
              Draw Signature
            </button>
            <button onClick={uploadSignature}>Upload Signature</button>
          </div>
        );

      case "image":
        if (meta.imageBase64) {
          return (
            <img
              src={meta.imageBase64}
              className="w-full h-full object-contain"
            />
          );
        }
        return (
          <button className="text-blue-600 text-xs" onClick={uploadImage}>
            Upload Image
          </button>
        );

      case "date":
        return (
          <input
            type="date"
            value={meta.date || ""}
            onChange={(e) => updateMeta({ date: e.target.value })}
            className="text-xs w-full h-full p-1 bg-transparent"
          />
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={meta.checked || false}
            onChange={(e) => updateMeta({ checked: e.target.checked })}
          />
        );

      case "radio":
        return (
          <input
            type="radio"
            checked={meta.checked || false}
            onChange={() => updateMeta({ checked: true })}
          />
        );

      default:
        return field.type;
    }
  };

  return (
    <>
      <div ref={elRef} style={style} onMouseDown={startDrag}>
        {renderFieldContent()}

        <div
          onMouseDown={startResize}
          className="absolute w-3 h-3 bg-blue-700 right-1 bottom-1 cursor-se-resize rounded-sm"
        />
      </div>

      {showSignaturePad && (
        <SignaturePadModal
          onClose={() => setShowSignaturePad(false)}
          onSave={(base64) => updateMeta({ signatureBase64: base64 })}
        />
      )}
    </>
  );
}
