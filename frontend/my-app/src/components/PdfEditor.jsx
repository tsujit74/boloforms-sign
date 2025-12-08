import React from "react";
import { EditorProvider } from "../context/EditorContext";
import UploadPdf from "../components/UploadPdf";
import FieldSidebar from "../components/FieldSidebar";
import Toolbar from "../components/Toolbar";
import PDFViewer from "../components/PdfViewer";
import PropertiesPanel from "../components/PropertiesPanel";
import SaveButton from "../components/SaveButton";

export default function PdfEditor() {
  return (
    <EditorProvider>
      <div className="w-full grid grid-cols-[260px_1fr_320px] gap-4">
        <aside className="bg-white rounded-lg shadow p-4">
          <UploadPdf />
          <FieldSidebar />
        </aside>

        <main className="flex flex-col gap-3">
          <Toolbar />
          <div className="bg-white rounded-lg shadow overflow-hidden p-4 h-[80vh]">
            <PDFViewer />
          </div>
          <div className="flex justify-end">
            <SaveButton />
          </div>
        </main>

        <aside className="bg-white rounded-lg shadow p-4">
          <PropertiesPanel />
        </aside>
      </div>
    </EditorProvider>
  );
}
