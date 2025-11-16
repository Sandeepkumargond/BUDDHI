// src/app/(dashboard)/faculty/study-material/_components/UploadForm.js
"use client";

import React from "react";
import FileUploader from "./FileUploader";

export default function UploadForm({
  form,
  setForm,
  files,
  setFiles,
  onFilesAdded = () => {},
  onSaveDraft = () => {},
  onPublishNow = () => {},
  onOpenSchedule = () => {},
  onOpenVersions = () => {},
}) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") setForm((prev) => ({ ...prev, [name]: checked }));
    else setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesAdded = (list) => {
    setFiles((prev) => [...prev, ...list]);
    onFilesAdded(list);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* HEADER */}
      <div className="px-4 py-3 border-b" style={{ background: "#C3EBFA" }}>
        <h2 className="text-lg font-semibold">Upload Study Material</h2>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Title */}
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Material Title"
          className="border p-2 rounded"
        />

        {/* Type */}
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option>Lecture Notes</option>
          <option>PPT</option>
          <option>Reference Book</option>
          <option>Question Bank</option>
          <option>Assignment</option>
          <option>Lab Manual</option>
          <option>Video Lecture</option>
          <option>External Link</option>
        </select>

        {/* Subject */}
        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Subject Code (e.g., CS201)"
          className="border p-2 rounded"
        />

        {/* Semester */}
        <input
          name="semester"
          value={form.semester}
          onChange={handleChange}
          placeholder="Semester (e.g., 3)"
          className="border p-2 rounded"
        />

        {/* Section */}
        <input
          name="section"
          value={form.section}
          onChange={handleChange}
          placeholder="Section (A/B/C)"
          className="border p-2 rounded"
        />

        {/* Links */}
        <input
          name="externalLinks"
          value={form.externalLinks}
          onChange={handleChange}
          placeholder="External links (comma separated)"
          className="border p-2 rounded"
        />

        {/* Description */}
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Short description"
          className="col-span-1 md:col-span-2 border p-2 rounded"
          rows={4}
        />

        {/* FILE UPLOADER */}
        <div className="col-span-1 md:col-span-2">
          <div className="mb-2 text-sm text-gray-600">
            Files (drag & drop or browse)
          </div>

          <FileUploader onFilesAdded={handleFilesAdded} />

          {/* Show Selected Files */}
          {files.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm">
              {files.map((file, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <div>
                    {file.name} • {(file.size / 1000).toFixed(0)} KB
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="text-xs text-red-500"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* VISIBILITY SETTINGS */}
        <div className="col-span-1 md:col-span-2 flex items-center flex-wrap gap-3">

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="downloadAllowed"
              checked={!!form.downloadAllowed}
              onChange={handleChange}
            />
            <span className="text-sm">Download Allowed</span>
          </label>

          <select
            name="visibilityTo"
            value={form.visibilityTo}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="All">Visible to All</option>
            <option value="Selected">Selected Sections</option>
          </select>

          <input
            name="visibilitySections"
            value={form.visibilitySections}
            onChange={handleChange}
            placeholder="Sections (comma separated)"
            className="border p-2 rounded"
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="col-span-1 md:col-span-2 flex items-center gap-3">

          <button
            type="button"
            onClick={onOpenSchedule}
            className="px-4 py-2 rounded bg-[#FAE27C]"
          >
            Set Schedule
          </button>

          <button
            type="button"
            onClick={onOpenVersions}
            className="px-4 py-2 rounded bg-gray-200"
          >
            Version History
          </button>

          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={onSaveDraft}
              className="px-4 py-2 rounded bg-gray-200"
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={onPublishNow}
              className="px-4 py-2 rounded bg-[#C3EBFA]"
            >
              Publish Now
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
