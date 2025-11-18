"use client";

import { useState } from "react";
import Image from "next/image";
import {
  noticeAudienceOptions,
  noticePriorityLevels,
} from "@/lib/roushaniData";

export default function AddNoticePage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [audience, setAudience] = useState(noticeAudienceOptions[0].value);
  const [priority, setPriority] = useState("normal");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required.";
    if (!date) e.date = "Date is required.";
    if (!content.trim()) e.content = "Content is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    alert("Notice published!");

    // Later: save notice to database
  };

  return (
    <div className="p-6 m-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-700">Add Notice</h1>
          <p className="text-sm text-gray-500 mt-1">
            Publish notice for students, faculty or staff.
          </p>
        </div>
      </div>

      {/* FORM WRAPPER */}
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-[#F5F9FF] border border-[#DCE7FF] rounded-xl p-6 shadow-sm space-y-6"
        >
          {/* TITLE */}
          <div>
            <label className="text-sm text-gray-700 font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notice title"
              className={`w-full mt-2 p-2.5 rounded-md bg-white border ${
                errors.title ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          {/* DATE & AUDIENCE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DATE */}
            <div>
              <label className="text-sm text-gray-700 font-medium">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full mt-2 p-2.5 rounded-md bg-white border ${
                  errors.date ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.date && (
                <p className="text-xs text-red-600 mt-1">{errors.date}</p>
              )}
            </div>

            {/* AUDIENCE FROM DUMMY DATA */}
            <div>
              <label className="text-sm text-gray-700 font-medium">Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full mt-2 p-2.5 rounded-md bg-white border border-gray-300"
              >
                {noticeAudienceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PRIORITY (DUMMY) */}
          <div>
            <label className="text-sm text-gray-700 font-medium">Priority</label>
            <div className="flex gap-3 mt-2">
              {noticePriorityLevels.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`px-4 py-2 rounded-md text-sm border capitalize ${
                    priority === p.value
                      ? p.value === "low"
                        ? "bg-green-100 border-green-400"
                        : p.value === "normal"
                        ? "bg-yellow-100 border-yellow-400"
                        : "bg-red-100 border-red-400"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT */}
          <div>
            <label className="text-sm text-gray-700 font-medium">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Write notice details..."
              className={`w-full mt-2 p-3 rounded-md bg-white border ${
                errors.content ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.content && (
              <p className="text-xs text-red-600 mt-1">{errors.content}</p>
            )}
          </div>

          {/* ATTACHMENT */}
          <div>
            <label className="text-sm text-gray-700 font-medium">Attachment</label>
            <label className="flex items-center gap-3 mt-2 px-4 py-3 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setAttachment(f);
                  setAttachmentName(f ? f.name : "");
                }}
              />
              <span className="text-sm text-gray-600">📎 Upload File</span>
              <span className="text-sm text-gray-500 truncate">
                {attachmentName || "No file selected"}
              </span>
            </label>

            {attachmentName && (
              <button
                type="button"
                onClick={() => {
                  setAttachment(null);
                  setAttachmentName("");
                }}
                className="text-xs text-red-600 mt-1"
              >
                Remove
              </button>
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-300">
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setDate("");
                setAudience("all");
                setPriority("normal");
                setContent("");
                setAttachment(null);
                setAttachmentName("");
              }}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Reset
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Publish Notice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
