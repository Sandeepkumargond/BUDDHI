"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { useAuth } from "@/context/AuthContext";

export default function CreateFeedbackFormPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    title: "Feedback Form",
    description: "",
    department: "",
    branch: "",
    batch: "",
    semester: 1,
    section: "",
    startDate: "",
    endDate: "",
  });

  const [questions, setQuestions] = useState([
    { questionId: 1, question: "Faculty clarity and communication", type: "rating" },
    { questionId: 2, question: "Course content quality and relevance", type: "rating" },
    { questionId: 3, question: "Availability and support outside class", type: "rating" },
    { questionId: 4, question: "Fairness in grading", type: "rating" },
    { questionId: 5, question: "Overall teaching effectiveness", type: "rating" },
  ]);

  useEffect(() => {
    if (role !== "admin") {
      router.push("/");
    }
    fetchDepartments();
  }, [role, router]);

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const res = await apiService.getAllDepartments();
      console.log("Departments API response:", res);
      if (res.data?.departments) {
        console.log("Setting departments:", res.data.departments);
        setDepartments(res.data.departments);
      } else {
        console.warn("No departments in response:", res);
        setDepartments([]);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      showToast.error("Failed to load departments");
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "semester" ? Number(value) : value,
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionId: prev.length + 1,
        question: "",
        type: "rating",
      },
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.department ||
      !formData.batch ||
      !formData.startDate ||
      !formData.endDate
    ) {
      showToast.error("Please fill all required fields");
      return;
    }

    if (questions.length === 0) {
      showToast.error("Please add at least one question");
      return;
    }

    const unansweredQuestions = questions.filter((q) => !q.question.trim());
    if (unansweredQuestions.length > 0) {
      showToast.error("Please fill all question texts");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        academicYear: new Date().getFullYear().toString(),
        questions,
      };

      await apiService.createFeedbackForm(payload);
      showToast.success("Feedback form created successfully!");
      router.push("/admin/feedback-forms");
    } catch (error) {
      showToast.error(error.message || "Failed to create feedback form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Create Feedback Form</h1>
        <p className="text-gray-600 mt-2">
          Create a feedback form for students to evaluate faculty members
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Form Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              disabled={loadingDepartments}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingDepartments ? "Loading departments..." : "Select Department"}
              </option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept.name}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch *
            </label>
            <input
              type="text"
              name="batch"
              value={formData.batch}
              onChange={handleInputChange}
              placeholder="e.g., 2023-2027"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester *
            </label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section/Class
            </label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              placeholder="e.g., A, B, C"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch
            </label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleInputChange}
              placeholder="e.g., CSE, ECE"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Additional instructions or context for the feedback form"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Questions Section */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Feedback Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
            >
              + Add Question
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text
                    </label>
                    <textarea
                      value={q.question}
                      onChange={(e) =>
                        handleQuestionChange(index, "question", e.target.value)
                      }
                      placeholder="Enter the feedback question"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={q.type}
                      onChange={(e) =>
                        handleQuestionChange(index, "type", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="rating">Rating (1-5)</option>
                      <option value="text">Text</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Feedback Form"}
          </button>
        </div>
      </form>
    </div>
  );
}
