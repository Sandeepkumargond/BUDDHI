"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiService } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { MdArrowBack, MdStar } from "react-icons/md";

export default function FeedbackFormFillPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState({});
  const [hoverRating, setHoverRating] = useState({});

  useEffect(() => {
    fetchForm();
  }, [params.subjectId]);

  const fetchForm = async () => {
    setLoading(true);
    try {
      // The subjectId is the composite ID: baseFormId---courseId---facultyId (or regular form ID)
      // Pass it directly to the API endpoint which will handle the parsing
      const res = await apiService.getFeedbackFormById(params.subjectId);
      let feedbackForm = res.data?.form;

      setForm(feedbackForm);

      // Initialize responses object
      const initialResponses = {};
      feedbackForm.questions?.forEach((question, index) => {
        initialResponses[index] = question.type === "rating" ? 0 : "";
      });
      setResponses(initialResponses);
    } catch (error) {
      showToast.error("Failed to fetch form");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (questionIndex, rating) => {
    setResponses({
      ...responses,
      [questionIndex]: rating,
    });
  };

  const handleTextChange = (questionIndex, text) => {
    setResponses({
      ...responses,
      [questionIndex]: text,
    });
  };

  const validateResponses = () => {
    for (let i = 0; i < form.questions.length; i++) {
      if (form.questions[i].type === "rating") {
        if (!responses[i] || responses[i] === 0) {
          showToast.error(`Please rate question ${i + 1}`);
          return false;
        }
      } else {
        if (!responses[i] || responses[i].trim() === "") {
          showToast.error(`Please answer question ${i + 1}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateResponses()) return;

    setSubmitting(true);
    try {
      // Convert responses to the format expected by the backend
      const feedbackData = {
        formId: params.subjectId,
        responses: form.questions.map((question, index) => ({
          questionId: index,
          answer: responses[index],
        })),
      };

      // Only add courseId and facultyId if they are strings (from composite ID)
      if (typeof form.courseId === 'string') {
        feedbackData.courseId = form.courseId;
      }
      if (typeof form.facultyId === 'string') {
        feedbackData.facultyId = form.facultyId;
      }

      await apiService.submitFeedbackForm(feedbackData);
      showToast.success("Feedback submitted successfully!");
      router.push("/student/feedback");
    } catch (error) {
      showToast.error(error.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 m-4 bg-white rounded-xl text-center">
        <p className="text-gray-600">Loading feedback form...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-6 m-4 bg-white rounded-xl text-center">
        <p className="text-red-600">Form not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 m-4 bg-white rounded-xl border border-gray-100 shadow-sm max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/student/feedback"
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <MdArrowBack /> Back to Forms
      </Link>

      {/* Form Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{form.title}</h1>
        {form.description && (
          <p className="text-gray-600 mb-4">{form.description}</p>
        )}
        <div className="space-y-1 text-sm text-gray-600">
          <p>
            <span className="font-medium">Department:</span> {form.department}
          </p>
          <p>
            <span className="font-medium">Semester:</span> {form.semester}
          </p>
          {form.section && (
            <p>
              <span className="font-medium">Section:</span> {form.section}
            </p>
          )}
        </div>
      </div>

      {/* Questions Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {form.questions?.map((question, index) => (
            <div key={index} className="pb-8 border-b border-gray-200 last:border-b-0">
              {/* Question Text */}
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                {index + 1}. {question.question}
              </label>

              {/* Rating Question */}
              {question.type === "rating" ? (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingClick(index, rating)}
                      onMouseEnter={() =>
                        setHoverRating({ ...hoverRating, [index]: rating })
                      }
                      onMouseLeave={() =>
                        setHoverRating({ ...hoverRating, [index]: null })
                      }
                      className={`transition-all ${
                        responses[index] >= rating ||
                        (hoverRating[index] && hoverRating[index] >= rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      <MdStar size={40} />
                    </button>
                  ))}
                  {responses[index] > 0 && (
                    <p className="ml-4 text-sm text-gray-600">
                      Rating: <span className="font-semibold">{responses[index]}/5</span>
                    </p>
                  )}
                </div>
              ) : (
                /* Text Question */
                <textarea
                  value={responses[index] || ""}
                  onChange={(e) => handleTextChange(index, e.target.value)}
                  placeholder="Please provide your feedback..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}

              {/* Question Type Indicator */}
              {responses[index] && question.type === "text" && (
                <p className="mt-2 text-sm text-gray-600">
                  Response: {responses[index]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
          <Link
            href="/student/feedback"
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold text-center hover:bg-gray-300 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
