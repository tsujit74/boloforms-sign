import React, { useRef, useEffect, useState } from "react";
import { useEditor } from "../context/EditorContext";
import FieldLayer from "./FieldLayer";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?worker&url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export default function PDFViewer() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const { pdfFile, setPdfMeta, pdfMeta, zoom } = useEditor();
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const renderTaskRef = useRef(null);

  useEffect(() => {
    if (!pdfFile) return;

    const safeCopy = pdfFile.slice(0);
    let cancelled = false;

    async function loadPdf() {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: safeCopy });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        setPdfDoc(pdf);

        // Load page sizes
        const pagesMeta = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const v = page.getViewport({ scale: 1 });
          pagesMeta.push({ width: v.width, height: v.height });
        }

        await renderPage(pdf, 1, pagesMeta);
      } catch (err) {
        console.error("PDF load error:", err);
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfFile, zoom]);

  async function renderPage(pdf, pageNum, pagesMeta) {
    if (!containerRef.current) return;

    const page = await pdf.getPage(pageNum);
    const baseViewport = page.getViewport({ scale: 1 });

    const containerWidth = containerRef.current.clientWidth;
    const baseScale = containerWidth / baseViewport.width;
    const scale = baseScale * zoom;

    const viewport = page.getViewport({ scale });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    renderTaskRef.current = page.render({ canvasContext: ctx, viewport });
    await renderTaskRef.current.promise;

    setPdfMeta({
      width: viewport.width,
      height: viewport.height,
      originalWidth: baseViewport.width,
      originalHeight: baseViewport.height,
      scale,
      pages: pdf.numPages,
      currentPage: pageNum,
      pagesMeta,
    });
  }

  useEffect(() => {
    if (!pdfDoc || !pdfMeta) return;

    renderPage(pdfDoc, pageNumber, pdfMeta.pagesMeta);
  }, [pageNumber, zoom]);

  if (!pdfFile) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        Upload a PDF to begin
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-sm">Page {pageNumber}</div>

        <div className="flex gap-2">
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            className="px-2 py-1 bg-white shadow-sm"
          >
            Prev
          </button>

          <button
            onClick={() =>
              setPageNumber((p) => Math.min(pdfMeta?.pages || 1, p + 1))
            }
            className="px-2 py-1 bg-white  shadow-sm"
          >
            Next
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-full bg-gray-50 flex items-start justify-center overflow-auto pt-2"
      >
        <div className="relative">
          <canvas ref={canvasRef} className="shadow-lg" />
          <FieldLayer />
        </div>
      </div>
    </div>
  );
}
