// src/app/(dashboard)/faculty/study-material/_components/FileUploader.js
"use client";

import { useRef } from "react";

export default function FileUploader({ onFilesAdded = () => {} }) {
  const inputRef = useRef();

  function handleFiles(files) {
    const arr = Array.from(files).map(file => {
      const preview = URL.createObjectURL(file);
      return { ...file, preview };
    });
    onFilesAdded(arr);
  }

  function onDrop(e) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="border-2 border-dashed rounded p-6 text-center bg-gray-50 cursor-pointer"
        onClick={() => inputRef.current.click()}
      >
        <div className="text-sm text-gray-600">Drag & drop files here or click to browse</div>
        <div className="mt-2 text-xs text-gray-400">PDF, PPTX, DOCX, ZIP, Images, Videos</div>
      </div>

      <input ref={inputRef} type="file" multiple accept="application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip,image/*,video/*" onChange={(e) => handleFiles(e.target.files)} className="hidden" />
    </div>
  );
}
