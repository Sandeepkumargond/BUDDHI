"use client";

import { useEffect, useMemo, useState } from "react";
import { apiService } from "@/lib/api";
import { showToast } from "@/lib/toast";

export default function FacultyClassNoticePage() {
  const [courses, setCourses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.course?._id === selectedCourseId || c.courseId === selectedCourseId),
    [courses, selectedCourseId]
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, noticesRes] = await Promise.all([
        apiService.getFacultyCourses(),
        apiService.getFacultyClassNotices(),
      ]);
      const fetchedCourses = coursesRes?.data?.courses || [];
      setCourses(fetchedCourses);
      if (!selectedCourseId && fetchedCourses.length) {
        setSelectedCourseId(fetchedCourses[0].course?._id || fetchedCourses[0].courseId);
      }
      setNotices(noticesRes?.data?.notices || []);
    } catch (error) {
      showToast.error(error?.message || "Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const validate = () => {
    const e = {};
    if (!selectedCourseId) e.courseId = "Select a course";
    if (!title.trim()) e.title = "Title is required";
    if (!content.trim()) e.content = "Notice content is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("courseId", selectedCourseId);
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      if (selectedCourse?.section) formData.append("section", selectedCourse.section);
      if (attachment) formData.append("attachment", attachment);

      await apiService.createFacultyClassNotice(formData);
      showToast.success("Notice published");
      setTitle("");
      setContent("");
      setAttachment(null);
      setAttachmentName("");
      setShowForm(false);
      await loadData();
    } catch (error) {
      showToast.error(error?.message || "Failed to publish notice");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 m-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-700">Class Notices</h1>
          <p className="text-sm text-gray-500 mt-1">Create and track notices for your assigned classes.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-black text-white text-sm hover:bg-gray-800"
        >
          <span className="text-lg">+</span>
          <span>Add notice</span>
        </button>
      </div>

      {showForm && (
        <div className="max-w-4xl mx-auto bg-[#F5F9FF] border border-[#DCE7FF] p-6 rounded-xl shadow-sm mb-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700 font-medium">Class</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className={`w-full mt-2 p-2.5 bg-white rounded-md border ${errors.courseId ? "border-red-400" : "border-gray-300"}`}
                >
                  <option value="">Select class</option>
                  {courses.map((c) => (
                    <option key={c.course?._id || c.courseId} value={c.course?._id || c.courseId}>
                      {c.displayText || `${c.course?.code} - ${c.course?.name}`}
                    </option>
                  ))}
                </select>
                {errors.courseId && <p className="text-xs text-red-600 mt-1">{errors.courseId}</p>}
                {selectedCourse && (
                  <p className="text-xs text-gray-500 mt-1">
                    Sem {selectedCourse.semester || selectedCourse.course?.semester}
                    {selectedCourse.section ? ` • Sec ${selectedCourse.section}` : ""}
                    {selectedCourse.academicYear ? ` • AY ${selectedCourse.academicYear}` : ""}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium">Notice Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notice title"
                className={`w-full mt-2 p-2.5 rounded-md bg-white border ${errors.title ? "border-red-400" : "border-gray-300"}`}
              />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium">Notice Message</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Write notice message..."
                className={`w-full mt-2 p-3 rounded-md bg-white border ${errors.content ? "border-red-400" : "border-gray-300"}`}
              />
              {errors.content && <p className="text-xs text-red-600 mt-1">{errors.content}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium">Attachment (optional)</label>
              <label className="flex items-center gap-3 mt-2 px-4 py-3 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setAttachment(f || null);
                    setAttachmentName(f ? f.name : "");
                  }}
                />
                <span className="text-sm text-gray-600">📎 Upload File</span>
                <span className="text-sm text-gray-500 truncate">{attachmentName || "No file selected"}</span>
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

            <div className="flex justify-end gap-3 border-t border-gray-300 pt-4">
              <button
                type="button"
                onClick={() => {
                  setTitle("");
                  setContent("");
                  setAttachment(null);
                  setAttachmentName("");
                  setErrors({});
                  setShowForm(false);
                }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? "Publishing..." : "Publish Notice"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-700">Your notices</h2>
          <div className="text-sm text-gray-500">{notices.length} total</div>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading notices...</p>
        ) : notices.length === 0 ? (
          <p className="text-gray-500 text-sm">No notices published yet.</p>
        ) : (
          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n._id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">{n.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {n.courseCode || n.courseName ? `${n.courseCode || ""} ${n.courseName || ""}`.trim() : ""}
                      {n.section ? ` • Sec ${n.section}` : ""}
                      {n.semester ? ` • Sem ${n.semester}` : ""}
                      {n.academicYear ? ` • AY ${n.academicYear}` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">{n.publishDate ? new Date(n.publishDate).toLocaleDateString() : ""}</span>
                </div>
                <p className="text-sm text-gray-700 mt-2 line-clamp-3 whitespace-pre-line">{n.content}</p>
                <div className="flex items-center gap-3 mt-3 text-sm text-gray-600">
                  {n.attachmentUrl && (
                    <a href={n.attachmentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      Attachment{n.attachmentName ? ` (${n.attachmentName})` : ""}
                    </a>
                  )}
                  <span className="text-xs text-gray-500">Views: {n.viewCount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
