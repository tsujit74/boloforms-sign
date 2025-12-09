import React from "react";
import PdfEditor from "./components/PdfEditor";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="pt-20 px-4 pb-6">
        <PdfEditor />
      </div>
    </div>
  );
}
