"use client";

import { useState } from "react";
import Image from "next/image";
import {
  studentProfileData,
  currentSemesterSubjects,
  studentFeedbackQuestions,
} from "@/lib/roushaniData";

export default function FeedbackFormPage() {
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (questionId, rating) => {
    setResponses((prev) => ({ ...prev, [questionId]: rating }));
  };

  const handleSubmit = () => {
    const unanswered = studentFeedbackQuestions.filter(
      (q) => !responses[q.id]
    );

    if (unanswered.length > 0) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmitted(true);
    console.log("Feedback Submitted:", responses);
  };

  return (
    <div className="p-6 m-4 bg-white rounded-xl border border-gray-100 shadow-sm max-w-4xl mx-auto">

      {/* ---------------------------- */}
      {/* STUDENT HEADER CARD */}
      {/* ---------------------------- */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F5F9FF] border border-[#DCE7FF] shadow-sm mb-6">
        <Image
          src={studentProfileData.photo}
          alt="Profile"
          width={60}
          height={60}
          className="rounded-full border"
        />
        <div>
          <h2 className="text-lg font-semibold text-gray-700">{studentProfileData.name}</h2>
          <p className="text-sm text-gray-500">Roll: {studentProfileData.roll}</p>
          <p className="text-sm text-gray-500">Department: {studentProfileData.department}</p>
        </div>
      </div>

      {/* PAGE HEADER */}
      <h1 className="text-2xl font-semibold text-gray-700 mb-2">Course Feedback</h1>
      <p className="text-sm text-gray-500 mb-4">
        Please rate each statement honestly.
      </p>

      {/* ---------------------------- */}
      {/* SUCCESS CARD (visible after submit) */}
      {/* ---------------------------- */}
      {submitted && (
        <div className="mt-4 p-6 rounded-xl bg-green-50 border border-green-200 shadow-sm text-center">
          <Image
            src="/success.png"
            width={70}
            height={70}
            alt="Success"
            className="mx-auto mb-3"
          />
          <h2 className="text-xl font-semibold text-green-700">
            Feedback Submitted Successfully!
          </h2>
          <p className="text-sm text-green-700 mt-1">
            Thank you for sharing your feedback. Your response has been recorded.
          </p>
        </div>
      )}

      {/* ---------------------------- */}
      {/* FEEDBACK FORM (Hides after submit) */}
      {/* ---------------------------- */}
      {!submitted && (
        <div className="bg-[#F5F9FF] border border-[#DCE7FF] rounded-xl p-5 shadow-sm">

          <div className="flex flex-col gap-6">
            {studentFeedbackQuestions.map((q) => (
              <div
                key={q.id}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <p className="text-sm font-medium text-gray-700 mb-3">{q.question}</p>

                {/* Rating Buttons */}
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRating(q.id, rating)}
                      className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium border transition
                        ${
                          responses[q.id] === rating
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white border-gray-300 hover:bg-gray-100"
                        }
                      `}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
