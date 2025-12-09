import React from "react";
import UploadPdf from "./UploadPdf";
import FieldSidebar from "./FieldSidebar";
import Toolbar from "./ToolBar";
import PDFViewer from "./PdfViewer";
import PropertiesPanel from "./PropertiesPanel";
import SaveButton from "./SaveButton";

export default function PdfEditor() {
  return (
    <div className="w-full h-full grid grid-cols-[260px_1fr_320px] gap-4">
      
      <aside className="bg-white rounded-xl shadow p-4 h-[85vh] overflow-y-auto">
        <UploadPdf />
        <FieldSidebar />
      </aside>

     
      <main className="flex flex-col gap-3">
        <Toolbar />

        <div className="bg-white rounded-xl shadow p-4 h-[78vh] overflow-hidden">
          <PDFViewer />
        </div>

        
      </main>

      <aside className="bg-white rounded-xl shadow p-4 h-[85vh] overflow-y-auto">
        <PropertiesPanel />
      </aside>
    </div>
  );
}
