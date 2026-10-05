import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GripVertical, Trash2, XCircle } from "lucide-react";
import { useEditor } from "../context/EditorContext";
import SignaturePadModal from "../components/SignaturePadModel";
import { pixelsToRelative, relativeToPixels } from "../utils/pdfUtils";

const GRID = 4;
const MIN_SIZE = 20;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_IMAGE_DIM = 1200;
const DRAG_THRESHOLD = 3;

const snap = (v) => Math.round(v / GRID) * GRID;
const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const ratio = Math.min(
          1,
          MAX_IMAGE_DIM / Math.max(img.width, img.height),
        );
        const w = Math.max(1, Math.round(img.width * ratio));
        const h = Math.max(1, Math.round(img.height * ratio));

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);

        const keepAlpha = /png|gif|webp|svg/.test(file.type);
        resolve(
          keepAlpha
            ? canvas.toDataURL("image/png")
            : canvas.toDataURL("image/jpeg", 0.9),
        );
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };

    img.src = url;
  });
}

function DraggableField({ field }) {
  const { pdfMeta, setFields, selectedId, setSelectedId } = useEditor();

  const rootRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadKindRef = useRef("image");
  const dragRef = useRef(null);

  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [local, setLocal] = useState({
    x: field.x,
    y: field.y,
    w: field.w,
    h: field.h,
  });
  const localRef = useRef(local);

  const selected = selectedId === field.id;
  const meta = field.meta || {};

  useEffect(() => {
    if (dragRef.current) return;
    const next = { x: field.x, y: field.y, w: field.w, h: field.h };
    localRef.current = next;
    setLocal(next);
  }, [field.x, field.y, field.w, field.h]);

  const updateMeta = useCallback(
    (changes) => {
      setFields((prev) =>
        prev.map((f) =>
          f.id === field.id
            ? { ...f, meta: { ...(f.meta || {}), ...changes } }
            : f,
        ),
      );
    },
    [field.id, setFields],
  );

  const removeField = useCallback(() => {
    setFields((prev) => prev.filter((f) => f.id !== field.id));
    setSelectedId?.(null);
  }, [field.id, setFields, setSelectedId]);

  useEffect(() => {
    if (!selected) return;

    function onKey(e) {
      if (isTypingTarget(e.target)) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeField();
      } else if (e.key === "Escape") {
        setSelectedId?.(null);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, removeField, setSelectedId]);

  if (!pdfMeta) return null;

  const PDF_W = pdfMeta.width;
  const PDF_H = pdfMeta.height;
  const px = relativeToPixels(local, PDF_W, PDF_H);

  function beginInteraction(e, mode) {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    setSelectedId?.(field.id);
    rootRef.current.setPointerCapture(e.pointerId);

    dragRef.current = {
      mode,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      start: { ...px },
      moved: false,
    };
  }

  function onRootPointerDown(e) {
    if (e.target.closest("input, button, textarea, select, [data-nodrag]")) {
      setSelectedId?.(field.id);
      return;
    }
    e.stopPropagation();
    beginInteraction(e, "move");
  }

  function onResizePointerDown(e) {
    e.stopPropagation();
    beginInteraction(e, "resize");
  }

  function onPointerMove(e) {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    if (!d.moved && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
    d.moved = true;

    let { left, top, width, height } = d.start;

    if (d.mode === "move") {
      left = clamp(snap(left + dx), 0, PDF_W - width);
      top = clamp(snap(top + dy), 0, PDF_H - height);
    } else {
      width = clamp(
        snap(width + dx),
        Math.min(MIN_SIZE, PDF_W - left),
        PDF_W - left,
      );
      height = clamp(
        snap(height + dy),
        Math.min(MIN_SIZE, PDF_H - top),
        PDF_H - top,
      );
    }

    const rel = pixelsToRelative({ left, top, width, height }, PDF_W, PDF_H);
    localRef.current = rel;
    setLocal(rel);
  }

  function endInteraction(e) {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;

    dragRef.current = null;
    if (rootRef.current?.hasPointerCapture?.(e.pointerId)) {
      rootRef.current.releasePointerCapture(e.pointerId);
    }

    if (d.moved) {
      const next = localRef.current;
      setFields((prev) =>
        prev.map((f) => (f.id === field.id ? { ...f, ...next } : f)),
      );
    }
  }

  // ---------- image / signature upload ----------

  function openFilePicker(kind) {
    uploadKindRef.current = kind;
    fileInputRef.current?.click();
  }

  async function onFileChosen(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return; // dialog cancelled

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert("Image is too large. Maximum size is 5 MB.");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      updateMeta(
        uploadKindRef.current === "signature"
          ? { signatureBase64: dataUrl }
          : { imageBase64: dataUrl },
      );
    } catch (err) {
      console.error(err);
      alert("Could not load this image.");
    }
  }

  // ---------- content ----------

  const fontSize = Math.max(10, Math.min(px.height * 0.55, 28));
  const hasImage =
    (field.type === "signature" && meta.signatureBase64) ||
    (field.type === "image" && meta.imageBase64);

  function renderContent() {
    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={meta.text || ""}
            placeholder="Type..."
            onChange={(e) => updateMeta({ text: e.target.value })}
            style={{ fontSize }}
            className="w-full h-full px-1 outline-none bg-transparent"
          />
        );

      case "signature":
        if (meta.signatureBase64) {
          return (
            <img
              src={meta.signatureBase64}
              alt="Signature"
              draggable={false}
              className="w-full h-full object-contain pointer-events-none"
            />
          );
        }
        return (
          <div className="flex flex-col items-center justify-center gap-1 text-xs text-gray-600">
            <button
              className="underline"
              onClick={() => setShowSignaturePad(true)}
            >
              Draw Signature
            </button>
            <button
              className="underline"
              onClick={() => openFilePicker("signature")}
            >
              Upload Signature
            </button>
          </div>
        );

      case "image":
        if (meta.imageBase64) {
          return (
            <img
              src={meta.imageBase64}
              alt="Uploaded"
              draggable={false}
              className="w-full h-full object-contain pointer-events-none"
            />
          );
        }
        return (
          <button
            className="text-xs text-gray-600 underline"
            onClick={() => openFilePicker("image")}
          >
            Upload Image
          </button>
        );

      case "date":
        return (
          <input
            type="date"
            value={meta.date || ""}
            onChange={(e) => updateMeta({ date: e.target.value })}
            style={{ fontSize: Math.min(fontSize, 16) }}
            className="w-full h-full px-1 bg-transparent outline-none"
          />
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={!!meta.checked}
            onChange={(e) => updateMeta({ checked: e.target.checked })}
            style={{ width: "70%", height: "70%" }}
          />
        );

      case "radio":
        return (
          <input
            type="radio"
            checked={!!meta.checked}
            onChange={() => {}}
            onClick={() => updateMeta({ checked: !meta.checked })}
            style={{ width: "70%", height: "70%" }}
          />
        );

      default:
        return <span className="text-xs text-gray-500">{field.type}</span>;
    }
  }

  const clearContent = () =>
    updateMeta(
      field.type === "signature"
        ? { signatureBase64: null }
        : { imageBase64: null },
    );

  const toolbarBelow = px.top < 28;

  return (
    <>
      <div
        ref={rootRef}
        onPointerDown={onRootPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endInteraction}
        onPointerCancel={endInteraction}
        style={{
          position: "absolute",
          left: px.left,
          top: px.top,
          width: px.width,
          height: px.height,
          pointerEvents: "auto",
          touchAction: "none",
          zIndex: selected ? 9999 : 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: hasImage ? "transparent" : "rgba(255,255,255,0.92)",
          border: selected ? "2px solid #2563eb" : "2px dashed #9ca3af",
          borderRadius: 4,
          boxSizing: "border-box",
          cursor: dragRef.current ? "grabbing" : "move",
        }}
      >
        {renderContent()}

        {!selected && <div className="absolute inset-0" />}

        {selected && (
          <div
            className={`absolute left-0 flex items-center gap-2 bg-blue-600 text-white rounded px-2 py-1 shadow ${
              toolbarBelow ? "top-full mt-1" : "-top-11"
            }`}
          >
            <div className="p-1 cursor-grab touch-none">
              <GripVertical className="w-6 h-6" />
            </div>
            {hasImage && (
              <button
                onClick={clearContent}
                title="Clear"
                className="p-1 hover:text-yellow-200"
              >
                <XCircle className="w-6 h-6" />
              </button>
            )}
            <button
              onClick={removeField}
              title="Delete field"
              className="p-1 hover:text-red-200"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        )}

        {selected && (
          <div
            data-nodrag
            onPointerDown={onResizePointerDown}
            className="absolute -right-3 -bottom-3 w-7 h-7 bg-blue-600 border-2 border-white rounded-full cursor-se-resize touch-none"
          />
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onFileChosen}
      />

      {showSignaturePad &&
        createPortal(
          <SignaturePadModal
            onClose={() => setShowSignaturePad(false)}
            onSave={(base64) => {
              updateMeta({ signatureBase64: base64 });
              setShowSignaturePad(false);
            }}
          />,
          document.body,
        )}
    </>
  );
}

export default memo(DraggableField);
