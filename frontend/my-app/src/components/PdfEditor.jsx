import React, { useEffect, useState } from "react";
import { SlidersHorizontal, Wrench, X } from "lucide-react";
import { useEditor } from "../context/EditorContext";
import UploadPdf from "./UploadPdf";
import FieldSidebar from "./FieldSidebar";
import Toolbar from "./ToolBar";
import PDFViewer from "./PdfViewer";
import PropertiesPanel from "./PropertiesPanel";

function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint - 1}px)`;
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return isMobile;
}

function BottomSheet({ title, onClose, children }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[10000]" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-[10001] bg-white rounded-t-xl shadow-2xl max-h-[70dvh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          <button onClick={onClose} className="p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-3 pb-6">{children}</div>
      </div>
    </>
  );
}

export default function PdfEditor() {
  const isMobile = useIsMobile();
  const { selectedId, pdfFile } = useEditor();
  const [sheet, setSheet] = useState(null);

  useEffect(() => {
    if (isMobile && selectedId) setSheet(null);
  }, [selectedId, isMobile]);

  useEffect(() => {
    if (!isMobile) setSheet(null);
  }, [isMobile]);

  if (!isMobile) {
    return (
      <div className="w-full h-full grid grid-cols-[260px_1fr_320px] gap-4">
        <aside className="bg-white shadow p-2 h-[85vh] overflow-y-auto">
          <UploadPdf />
          <FieldSidebar />
        </aside>

        <main className="flex flex-col gap-3">
          <Toolbar />
          <div className="bg-white shadow p-2 h-[78vh] overflow-hidden">
            <PDFViewer />
          </div>
        </main>

        <aside className="bg-white shadow p-2 h-[85vh] overflow-y-auto">
          <PropertiesPanel />
        </aside>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100dvh-4rem)] flex flex-col gap-1 pb-14">
      <div className="overflow-x-auto shrink-0">
        <Toolbar />
      </div>

      <div className="flex-1 min-h-0 bg-white shadow p-0.5 overflow-hidden">
        <PDFViewer />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-[9998] bg-white border-t shadow-[0_-2px_8px_rgba(0,0,0,0.08)] grid grid-cols-2 pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={() => setSheet("tools")}
          className="flex flex-col items-center gap-0.5 py-2 text-gray-700 active:bg-gray-100"
        >
          <Wrench className="w-5 h-5" />
          <span className="text-xs">
            {pdfFile ? "Tools" : "Upload & Tools"}
          </span>
        </button>

        <button
          onClick={() => setSheet("props")}
          className="flex flex-col items-center gap-0.5 py-2 text-gray-700 active:bg-gray-100"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-xs">Properties</span>
        </button>
      </nav>

      {sheet === "tools" && (
        <BottomSheet title="Tools" onClose={() => setSheet(null)}>
          <UploadPdf />
          <FieldSidebar />
        </BottomSheet>
      )}

      {sheet === "props" && (
        <BottomSheet title="Properties" onClose={() => setSheet(null)}>
          <PropertiesPanel />
        </BottomSheet>
      )}
    </div>
  );
}
