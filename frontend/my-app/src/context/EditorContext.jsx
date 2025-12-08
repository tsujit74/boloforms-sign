import React, { createContext, useContext, useState } from "react";

const EditorContext = createContext();

export function EditorProvider({ children }) {
  const [pdfMeta, setPdfMeta] = useState(null);
  const [pdfFile, _setPdfFile] = useState(null); 
  const [fields, setFields] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(1);

  function setPdfFile(buffer) {
    if (!buffer) {
      _setPdfFile(null);
      return;
    }

    if (buffer instanceof ArrayBuffer) {
      const clone = buffer.slice(0);
      _setPdfFile(clone);
    } else {
      console.error("setPdfFile received non-arraybuffer:", buffer);
      _setPdfFile(null);
    }
  }

  return (
    <EditorContext.Provider
      value={{
        pdfMeta,
        setPdfMeta,
        pdfFile,
        setPdfFile,
        fields,
        setFields,
        selectedId,
        setSelectedId,
        zoom,
        setZoom,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export const useEditor = () => useContext(EditorContext);
