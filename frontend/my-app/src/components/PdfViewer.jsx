import React, { useRef, useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?worker&url";
import { useEditor } from "../context/EditorContext";
import FieldLayer from "./FieldLayer";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export default function PDFViewer() {
  const { pdfFile, pdfMeta, setPdfMeta, zoom } = useEditor();

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [pagesMeta, setPagesMeta] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [error, setError] = useState(null);

  const totalPages = pdfDoc?.numPages || 0;

  // 1) Load the PDF ONLY when the file changes
  useEffect(() => {
    if (!pdfFile) {
      setPdfDoc(null);
      setPagesMeta([]);
      setPageNumber(1);
      setError(null);
      setPdfMeta(null);
      return;
    }

    let cancelled = false;
    // slice(0): pdf.js transfers the buffer to its worker, so give it a copy
    const task = pdfjsLib.getDocument({ data: pdfFile.slice(0) });

    (async () => {
      try {
        setError(null);
        const pdf = await task.promise;
        if (cancelled) return;

        // page sizes, loaded in parallel (pages can have different sizes)
        const metas = await Promise.all(
          Array.from({ length: pdf.numPages }, async (_, i) => {
            const page = await pdf.getPage(i + 1);
            const v = page.getViewport({ scale: 1 });
            return { width: v.width, height: v.height };
          })
        );
        if (cancelled) return;

        setPagesMeta(metas);
        setPdfDoc(pdf);
        setPageNumber(1);
      } catch (err) {
        if (cancelled) return;
        console.error("PDF load error:", err);
        setError("Could not open this PDF. The file may be corrupted or password protected.");
      }
    })();

    return () => {
      cancelled = true;
      task.destroy(); // also frees the document and worker memory
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfFile]);

  // 2) Track container width (window resize, sidebar changes)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width) - 16; // room for padding/scrollbar
      setContainerWidth((prev) => (Math.abs(prev - w) > 1 ? Math.max(w, 100) : prev));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [pdfFile]);

  // 3) Render the current page whenever doc / page / zoom / width changes
  useEffect(() => {
    if (!pdfDoc || !containerWidth || !pagesMeta[pageNumber - 1]) return;

    let cancelled = false;

    (async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const base = page.getViewport({ scale: 1 });
        const scale = (containerWidth / base.width) * zoom;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        // sharp rendering on retina screens; CSS size stays = viewport size
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const ctx = canvas.getContext("2d");
        const task = page.render({
          canvasContext: ctx,
          viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null,
        });
        renderTaskRef.current = task;
        await task.promise;
        if (cancelled) return;

        // fields use CSS pixels, so meta uses viewport (CSS) size
        setPdfMeta({
          width: viewport.width,
          height: viewport.height,
          originalWidth: base.width,
          originalHeight: base.height,
          scale,
          pages: pdfDoc.numPages,
          currentPage: pageNumber,
          pagesMeta,
        });
      } catch (err) {
        if (err?.name === "RenderingCancelledException") return;
        console.error("PDF render error:", err);
      }
    })();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, pageNumber, zoom, containerWidth, pagesMeta]);

  const goTo = (p) => setPageNumber(Math.min(Math.max(1, p), totalPages || 1));

  if (!pdfFile) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        Upload a PDF to begin
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-red-600 text-center px-4">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          Page {pageNumber} / {totalPages || "…"}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => goTo(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="px-2 py-1 bg-white shadow-sm disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={() => goTo(pageNumber + 1)}
            disabled={!totalPages || pageNumber >= totalPages}
            className="px-2 py-1 bg-white shadow-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full flex-1 min-h-0 bg-gray-50 flex items-start justify-center overflow-auto pt-2"
      >
        {/* wrapper is exactly canvas-sized so FieldLayer (absolute inset-0) lines up */}
        <div className="relative shrink-0">
          <canvas ref={canvasRef} className="block shadow-lg" />
          <FieldLayer />
        </div>
      </div>
    </div>
  );
}