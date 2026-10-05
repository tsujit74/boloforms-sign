import React, { useEffect, useState } from "react";
import { Save, User, Menu, X } from "lucide-react";
import { useEditor } from "../context/EditorContext";

const LINKS = ["Home", "Docs", "Support"];

export default function Navbar() {
  const { pdfFile } = useEditor();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200 pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="font-semibold text-gray-800 text-base sm:text-lg whitespace-nowrap">
            Forms Sign
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          {LINKS.map((l) => (
            <button key={l} className="hover:text-blue-600 transition">
              {l}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            disabled={!pdfFile}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-white text-sm transition ${
              pdfFile
                ? "bg-gray-700 hover:bg-gray-500 active:scale-95"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            <Save size={18} />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition">
            <User size={18} />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 px-3 py-2 flex flex-col">
          {LINKS.map((l) => (
            <button
              key={l}
              onClick={() => setOpen(false)}
              className="text-left text-sm text-gray-700 py-3 border-b last:border-b-0 border-gray-100 active:bg-gray-100"
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}