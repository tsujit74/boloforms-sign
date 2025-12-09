<SignaturePadModal
  onClose={() => setShowSignaturePad(false)}
  onSave={(base64) => updateMeta({ signatureBase64: base64 })}
/>
import React, { useRef, useEffect, useState } from "react";

export default function SignaturePadModal({ onClose, onSave }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.width = 1000; 
    canvas.height = 500;

    canvas.style.touchAction = "none";

    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctxRef.current = ctx;
  }, []);

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function startDraw(e) {
    e.preventDefault();

    try {
      e.target.setPointerCapture(e.pointerId);
    } catch {}

    drawingRef.current = true;
    const pos = getPos(e);

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!drawingRef.current) return;
    e.preventDefault();

    const pos = getPos(e);
    ctxRef.current.lineTo(pos.x, pos.y);
    ctxRef.current.stroke();
  }

  function endDraw(e) {
    drawingRef.current = false;
    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch {}
  }

  function save() {
    const base64 = canvasRef.current.toDataURL("image/png");
    onSave(base64);
    onClose();
  }

  function clear() {
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999999]">
      <div className="bg-white p-4 rounded-0 shadow-xl w-[90vw] max-w-[900px]">
        <h3 className="font-semibold mb-2">Draw Your Signature</h3>

        <div className="border bg-gray-100" style={{ touchAction: "none" }}>
          <canvas
            ref={canvasRef}
            onPointerDown={startDraw}
            onPointerMove={draw}
            onPointerUp={endDraw}
            onPointerCancel={endDraw}
            style={{ width: "100%", height: "auto" }}
          />
        </div>

        <div className="flex justify-between mt-3">
          <button onClick={clear} className="px-3 py-1 bg-gray-200 rounded-0">
            Clear
          </button>

          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded-0">
              Cancel
            </button>
            <button onClick={save} className="px-3 py-1 bg-blue-600 text-white rounded-0">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
