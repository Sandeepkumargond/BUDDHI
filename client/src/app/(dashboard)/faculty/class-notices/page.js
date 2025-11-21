"use client";

import { useState } from "react";
import { showToast } from "@/lib/toast";
import {
  classNoticeDepartments,
  classNoticeSections,
  classNoticeSubjects,
} from "@/lib/roushaniData";

export default function FacultyClassNoticePage() {
  const [department, setDepartment] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!department) e.department = "Department is required.";
    if (!section) e.section = "Section is required.";
    if (!subject) e.subject = "Subject is required.";
    if (!title.trim()) e.title = "Title is required.";
    if (!content.trim()) e.content = "Notice content is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    alert("Class Notice Published Successfully!");

    console.log({
      department,
      section,
      subject,
      title,
      content,
      attachment,
    });

    setDepartment("");
    setSection("");
    setSubject("");
    setTitle("");
    setContent("");
    setAttachment(null);
    setAttachmentName("");
  };

  return (
    <div className="p-6 m-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Class Notice</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create and publish notices for your class.
        </p>
      </div>

      {/* FORM WRAPPER */}
      <div className="max-w-4xl mx-auto bg-[#F5F9FF] border border-[#DCE7FF] p-6 rounded-xl shadow-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Department + Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <label className="text-sm text-gray-700 font-medium">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={`w-full mt-2 p-2.5 bg-white rounded-md border ${
                  errors.department ? "border-red-400" : "border-gray-300"
                }`}
              >
                <option value="">Select Department</option>
                {classNoticeDepartments.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              {errors.department && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.department}
                </p>
              )}
            </div>

            {/* Section */}
            <div>
              <label className="text-sm text-gray-700 font-medium">
                Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className={`w-full mt-2 p-2.5 bg-white rounded-md border ${
                  errors.section ? "border-red-400" : "border-gray-300"
                }`}
              >
                <option value="">Select Section</option>
                {classNoticeSections.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              {errors.section && (
                <p className="text-xs text-red-600 mt-1">{errors.section}</p>
              )}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-sm text-gray-700 font-medium">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`w-full mt-2 p-2.5 bg-white rounded-md border ${
                errors.subject ? "border-red-400" : "border-gray-300"
              }`}
            >
              <option value="">Select Subject</option>
              {classNoticeSubjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {errors.subject && (
              <p className="text-xs text-red-600 mt-1">{errors.subject}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm text-gray-700 font-medium">
              Notice Title
            </label>
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

          {/* Message */}
          <div>
            <label className="text-sm text-gray-700 font-medium">
              Notice Message
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Write notice message..."
              className={`w-full mt-2 p-3 rounded-md bg-white border ${
                errors.content ? "border-red-400" : "border-gray-300"
              }`}
            />

            {errors.content && (
              <p className="text-xs text-red-600 mt-1">{errors.content}</p>
            )}
          </div>

          {/* Attachment */}
          <div>
            <label className="text-sm text-gray-700 font-medium">
              Attachment (optional)
            </label>

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

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-gray-300 pt-4">
            <button
              type="button"
              onClick={() => {
                setDepartment("");
                setSection("");
                setSubject("");
                setTitle("");
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
