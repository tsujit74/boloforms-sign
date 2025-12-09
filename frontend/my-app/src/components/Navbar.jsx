import React from "react";
import { Upload, Save, User } from "lucide-react";
import { useEditor } from "../context/EditorContext";

export default function Navbar() {
  const { pdfFile } = useEditor();

  return (
    <nav
      className="
        fixed top-0 left-0 right-0 z-50 
        backdrop-blur-md bg-white/70 
        border-b border-gray-200
      "
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-gray-800 text-lg">
          BoloForms Sign
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <button className="hover:text-blue-600 transition">Home</button>
          <button className="hover:text-blue-600 transition">Docs</button>
          <button className="hover:text-blue-600 transition">Support</button>
        </div>

        <div className="flex items-center gap-3">
         

          <input
            id="pdfUploadInput"
            type="file"
            className="hidden"
            accept="application/pdf"
          />

          <button
            disabled={!pdfFile}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg 
              text-white transition
              ${
                pdfFile
                  ? "bg-gray-700 hover:bg-gray-500"
                  : "bg-gray-300 cursor-not-allowed"
              }
            `}
          >
            <Save size={18} />
            Save
          </button>

          <button
            className="
              w-9 h-9 flex items-center justify-center 
              rounded-full bg-gray-100 hover:bg-gray-200 
              transition
            "
          >
            <User size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
