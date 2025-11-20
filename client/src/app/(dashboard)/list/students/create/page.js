"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import { showToast } from "@/lib/toast";

// SUCCESS CARD COMPONENT (NO global CSS)
function SuccessCard({ message, show }) {
  return (
    <div
      className={`
        fixed top-6 right-6 w-72 z-50
        bg-white border border-blue-200 shadow-lg rounded-xl p-4
        transition-all duration-500 
        ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-600 text-xl">✓</span>
        </div>
        <div>
          <p className="font-semibold text-gray-700">Success</p>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function CreateStudentPage() {
  const { role } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    personalMail: "",
    gender: "",
    program: "",
    branch: "",
    semester: "",
    mobile: "",
    registrationNumber: "",
    dateOfAdmission: "",
    dateOfBirth: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [showToast, setShowToast] = useState(false); // for animation

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const required = [
      "firstName","lastName","email","personalMail","gender",
      "program","branch","semester","mobile","registrationNumber",
      "dateOfAdmission","dateOfBirth","password",
    ];

    const newErr = {};
    required.forEach((f) => (!form[f] ? (newErr[f] = `${f} is required`) : null));

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      let data;
      if (role === "admin") {
        const res = await apiService.adminCreateStudent(form);
        data = res;
      } else if (role === "subadmin") {
        const res = await apiService.subAdminCreateStudent(form);
        data = res;
      } else {
        showToast.error("Unauthorized role");
        setLoading(false);
        return;
      }

      setLoading(false);

      if (!data || !data.success) {
        showToast.error(data?.message || "Something went wrong");
        return;
      }

      // Set success state
      setSuccessMsg("Student created successfully!");
      setShowToast(true);

      // Auto-hide animation
      setTimeout(() => setShowToast(false), 3500);

      // Reset form
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        personalMail: "",
        gender: "",
        program: "",
        branch: "",
        semester: "",
        mobile: "",
        registrationNumber: "",
        dateOfAdmission: "",
        dateOfBirth: "",
        password: "",
      });

    } catch (err) {
      setLoading(false);
      showToast.error("Server error");
    }
  };

  return (
    <div className="p-6 m-4 bg-white rounded-xl border border-gray-100 shadow-sm">

      {/* SUCCESS POPUP */}
      <SuccessCard message={successMsg} show={showToast} />

      <h1 className="text-2xl font-semibold text-gray-700">Create Student</h1>
      <p className="text-sm text-gray-500 mb-6">Enter student details correctly.</p>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 max-w-4xl mx-auto bg-[#F5F9FF] p-6 rounded-xl border border-[#DCE7FF]"
      >
        {/* NAME */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} />
          <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} />
        </div>

        {/* EMAILS */}
        <Input label="Email" name="email" value={form.email} onChange={handleChange} error={errors.email} />
        <Input label="Personal Email" name="personalMail" value={form.personalMail} onChange={handleChange} error={errors.personalMail} />

        {/* GENDER */}
        <Select label="Gender" name="gender" value={form.gender} onChange={handleChange} options={["Male","Female","Other"]} error={errors.gender} />

        {/* PROGRAM + BRANCH */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Program" name="program" value={form.program} onChange={handleChange} options={["B.Tech","M.Tech","PhD"]} error={errors.program} />
          <Select label="Branch" name="branch" value={form.branch} onChange={handleChange} options={["CSE","ECE","EEE","ME","CE"]} error={errors.branch} />
        </div>

        {/* SEMESTER + MOBILE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Semester" name="semester" type="number" value={form.semester} onChange={handleChange} error={errors.semester} />
          <Input label="Mobile" name="mobile" value={form.mobile} onChange={handleChange} error={errors.mobile} />
        </div>

        {/* REG NUMBER */}
        <Input label="Registration Number" name="registrationNumber" value={form.registrationNumber} onChange={handleChange} error={errors.registrationNumber} />

        {/* DATES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} error={errors.dateOfBirth} />
          <Input label="Date of Admission" name="dateOfAdmission" type="date" value={form.dateOfAdmission} onChange={handleChange} error={errors.dateOfAdmission} />
        </div>

        {/* PASSWORD */}
        <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} />

        {/* SUBMIT */}
        <div className="flex justify-end">
          <button
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create Student"}
          </button>
        </div>
      </form>
    </div>
  );
}

// -------- INPUT COMPONENT --------
function Input({ label, error, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className={`w-full mt-1 p-2 rounded-md border ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// -------- SELECT COMPONENT --------
function Select({ label, options, error, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        {...props}
        className={`w-full mt-1 p-2 rounded-md border ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((op) => (
          <option key={op}>{op}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
