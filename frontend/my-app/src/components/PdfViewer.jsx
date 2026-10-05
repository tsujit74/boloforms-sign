import React, { useRef, useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?worker&url";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEditor } from "../context/EditorContext";
import FieldLayer from "./FieldLayer";
import { createField, FIELD_MIME } from "../utils/fieldDefaults";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export default function PDFViewer() {
  const { pdfFile, pdfMeta, setPdfMeta, zoom, setFields, setSelectedId } =
    useEditor();

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [pagesMeta, setPagesMeta] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const totalPages = pdfDoc?.numPages || 0;

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
    const task = pdfjsLib.getDocument({ data: pdfFile.slice(0) });

    (async () => {
      try {
        setError(null);
        const pdf = await task.promise;
        if (cancelled) return;

        const metas = await Promise.all(
          Array.from({ length: pdf.numPages }, async (_, i) => {
            const page = await pdf.getPage(i + 1);
            const v = page.getViewport({ scale: 1 });
            return { width: v.width, height: v.height };
          }),
        );
        if (cancelled) return;

        setPagesMeta(metas);
        setPdfDoc(pdf);
        setPageNumber(1);
      } catch (err) {
        if (cancelled) return;
        console.error("PDF load error:", err);
        setError(
          "Could not open this PDF. The file may be corrupted or password protected.",
        );
      }
    })();

    return () => {
      cancelled = true;
      task.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfFile]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const padding = window.innerWidth < 640 ? 8 : 24;
      const w = Math.floor(entry.contentRect.width) - padding;
      setContainerWidth((prev) =>
        Math.abs(prev - w) > 1 ? Math.max(w, 100) : prev,
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [pdfFile, error, pdfDoc]);

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

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

  function handleDragOver(e) {
    if (!e.dataTransfer.types.includes(FIELD_MIME)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!dragOver) setDragOver(true);
  }

  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false);
  }

  function handleDrop(e) {
    setDragOver(false);
    const type = e.dataTransfer.getData(FIELD_MIME);
    if (!type || !pdfMeta) return;
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };

    const field = createField(type, pdfMeta.currentPage || 1, pos);
    setFields((prev) => [...prev, field]);
    setSelectedId?.(field.id);
  }

  const goTo = (p) => setPageNumber(Math.min(Math.max(1, p), totalPages || 1));

  if (!pdfFile) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-sm text-gray-500 text-center px-4">
        Upload a PDF to begin
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-sm text-red-600 text-center px-4">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="text-xs sm:text-sm whitespace-nowrap">
          Page {pageNumber} / {totalPages || "…"}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => goTo(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="flex items-center gap-1 px-3 py-2 sm:px-2 sm:py-1 text-sm bg-white shadow-sm border border-gray-200 active:bg-gray-100 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline">Prev</span>
          </button>
          <button
            onClick={() => goTo(pageNumber + 1)}
            disabled={!totalPages || pageNumber >= totalPages}
            className="flex items-center gap-1 px-3 py-2 sm:px-2 sm:py-1 text-sm bg-white shadow-sm border border-gray-200 active:bg-gray-100 disabled:opacity-40"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4 sm:hidden" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full flex-1 min-h-0 bg-gray-50 flex items-start overflow-auto overscroll-contain pt-2"
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative shrink-0 mx-auto transition-shadow ${
            dragOver ? "ring-4 ring-blue-400 ring-offset-2" : ""
          }`}
        >
          <canvas ref={canvasRef} className="block shadow-lg" />
          <FieldLayer />
        </div>
      </div>
    </div>
  );
}
