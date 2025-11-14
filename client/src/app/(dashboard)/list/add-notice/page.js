"use client";
import { useState } from "react";
import Image from "next/image";

const AddNoticePage = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [audience, setAudience] = useState("all");
  const [priority, setPriority] = useState("normal  ");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});
  const [attachment, setAttachment] = useState(null);
  const [attachmentName, setAttachmentName] = useState("");

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
    // TODO: submit to API
    console.log({ title, date, audience, priority, content });
    // reset
    setTitle("");
    setDate("");
    setAudience("all");
    setPriority("normal");
    setContent("");
    setErrors({});
    alert("Notice saved (stub).");
  };

  return (
    <div className="pt-3 px-6 pb-6 md:pt-6 md:px-10 md:pb-10 max-w-6xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">Add Notice</h1>
        <div className="hidden md:flex items-center gap-3 text-sm text-slate-500">
          <Image src="/notice.png" alt="notice" width={28} height={28} />
          <span>Compose and publish notices to students, faculty or staff</span>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <form className="lg:col-span-2 bg-white shadow-sm border border-slate-100 rounded-lg p-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.title ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:ring-sky-200"
              }`}
              placeholder="Enter notice title"
            />
            {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.date ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:ring-sky-200"
                }`}
              />
              {errors.date && <p className="mt-1 text-xs text-rose-600">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="all">All</option>
                <option value="students">Students</option>
                <option value="facultys">facultys</option>
                <option value="staff">Staff</option>
                <option value="department">Department</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700">Priority</label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`px-3 py-1.5 rounded-md text-sm border ${
                  priority === "low" ? "bg-green-50 border-green-300" : "bg-white border-slate-200"
                }`}
                onClick={() => setPriority("low")}
              >
                Low
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-md text-sm border ${
                  priority === "normal" ? "bg-yellow-50 border-amber-300" : "bg-white border-slate-200"
                }`}
                onClick={() => setPriority("normal")}
              >
                Normal
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-md text-sm border ${
                  priority === "high" ? "bg-rose-50 border-rose-300" : "bg-white border-slate-200"
                }`}
                onClick={() => setPriority("high")}
              >
                High
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.content ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:ring-sky-200"
              }`}
              placeholder="Write the notice content here..."
            />
            {errors.content && <p className="mt-1 text-xs text-rose-600">{errors.content}</p>}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-600">Attachments</label>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center px-3 py-2 bg-white border border-slate-200 rounded-md text-sm cursor-pointer hover:bg-slate-50">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setAttachment(f);
                      setAttachmentName(f ? f.name : "");
                    }}
                  />
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16v-8a4 4 0 118 0v8m-5-3h2" />
                  </svg>
                  <span className="ml-2">Choose file</span>
                </label>
                <span className="text-sm text-slate-500 max-w-xs truncate">{attachmentName || "No file chosen"}</span>
                {attachmentName && (
                  <button
                    type="button"
                    onClick={() => { setAttachment(null); setAttachmentName(""); }}
                    className="text-sm text-rose-600 px-2 py-1 border border-rose-100 rounded-md hover:bg-rose-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setTitle(""); setDate(""); setAudience("all"); setPriority("normal"); setContent(""); setErrors({}); }}
                className="px-4 py-2 rounded-md border bg-white text-sm hover:bg-slate-50"
              >
                Reset
              </button>
              <button type="submit" className="px-4 py-2 rounded-md bg-sky-600 text-white text-sm hover:bg-sky-700">
                Publish Notice
              </button>
            </div>
          </div>
        </form>

        {/* Preview */}
        <aside className="bg-slate-50 border border-slate-100 rounded-lg p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-slate-800">{title || "Notice title preview"}</h3>
              <p className="text-xs text-slate-500 mt-1">{date || "No date selected"} • {audience} • {priority}</p>
            </div>
            <div className="text-xs text-slate-400">Preview</div>
          </div>
          <div className="prose max-w-none text-slate-700">
            {content ? (
              <p>{content}</p>
            ) : (
              <p className="text-slate-400">Notice content preview will appear here while you type.</p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => alert("Preview share stub")}
              className="w-full text-sm px-3 py-2 rounded-md bg-white border hover:bg-slate-50"
            >
              Share Preview
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default AddNoticePage;