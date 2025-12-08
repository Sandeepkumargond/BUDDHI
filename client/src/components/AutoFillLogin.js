"use client";

import React from "react";

const ROLE_PRESETS = {
  student: { email: "aryan.arya@nitp.ac.in", password: "student123", displayName: "Aryan Arya" },
  faculty: { email: "priya.sharma@nitp.ac.in", password: "faculty123", displayName: "Priya Sharma" },
  alumni: { email: "alumni@nitp.ac.in", password: "alumni123", displayName: "Alumni User" },
  admin: { email: "admin@nitp.ac.in", password: "admin123", displayName: "Administrator" },
  subadmin: { email: "aakash.kumar@nitp.ac.in", password: "subAdmin@1234", displayName: "Aakash Kumar" },
  superadmin: { email: "superadmin1@buddhi.in", password: "Aakash789", displayName: "Super Admin" }
};

export default function AutoFillLogin({ onFill, role = "student", autoSubmit = false, onAutoSubmit }) {
  const handleAutoFill = () => {
    const preset = ROLE_PRESETS[role] || ROLE_PRESETS["student"];
    const payload = { ...preset, role };
    if (payload && typeof onFill === "function") onFill(payload);
    if (autoSubmit && typeof onAutoSubmit === "function") {
      // small delay to let form fields update
      setTimeout(() => onAutoSubmit(payload), 150);
    }
  };

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={handleAutoFill}
        title={`Auto-fill credentials for ${role}`}
        className="ml-3 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-sm rounded border hover:bg-gray-200"
      >
        Auto-fill (sample data)
      </button>
    </div>
  );
}
