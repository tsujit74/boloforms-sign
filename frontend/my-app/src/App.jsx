import React from "react";
import PdfEditor from "./components/PdfEditor";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="pt-14 md:pt-20 px-1 md:px-6 pb-2 md:pb-6">
        <PdfEditor />
      </div>
    </div>
  );
}