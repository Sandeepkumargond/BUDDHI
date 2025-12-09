"use client";
import React, { useState } from "react";

export default function RequestRegisterForm() {
  const [form, setForm] = useState({
    collegeName: "",
    collegeType: "",
    establishedYear: "",
    affiliation: "",
    totalStudents: "",
    totalFaculty: "",
    website: "",
    description: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
    adminName: "",
    adminDesignation: "",
    email: "",
    phone: "",
    alternatePhone: "",
    recognitionType: "",
    courses: "",
    infrastructure: "",
  });

  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFiles = (e) => {
    setDocuments(Array.from(e.target.files || []));
  };

  const validate = () => {
    const newErrors = {};
    const required = [
      ["collegeName", "College name is required"],
      ["collegeType", "College type is required"],
      ["establishedYear", "Established year is required"],
      ["affiliation", "Affiliation is required"],
      ["address", "Address is required"],
      ["state", "State is required"],
      ["city", "City is required"],
      ["pincode", "Pincode is required"],
      ["adminName", "Admin name is required"],
      ["adminDesignation", "Admin designation is required"],
      ["email", "Email is required"],
      ["phone", "Phone number is required"],
      ["recognitionType", "Recognition type is required"],
    ];

    required.forEach(([field, msg]) => {
      if (!String(form[field] || "").trim()) newErrors[field] = msg;
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) newErrors.email = "Please enter a valid email";

    if (form.pincode && !/^\d{6}$/.test(String(form.pincode))) newErrors.pincode = "Please enter a valid 6-digit pincode";

    const currentYear = new Date().getFullYear();
    if (form.establishedYear && (Number(form.establishedYear) < 1800 || Number(form.establishedYear) > currentYear)) {
      newErrors.establishedYear = `Please enter a valid year between 1800 and ${currentYear}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");

    try {
      const formData = new FormData();

      // Append all form fields
      Object.keys(form).forEach((key) => {
        if (form[key] !== undefined && form[key] !== null && form[key] !== '') {
          formData.append(key, String(form[key]));
        }
      });

      // Append documents
      documents.forEach((file) => {
        formData.append('documents', file);
      });

      // Use the backend API
      const { apiService } = await import('@/lib/api');
      await apiService.submitCollegeRequest(formData);

      setStatus("success");
      setForm({
        collegeName: "",
        collegeType: "",
        establishedYear: "",
        affiliation: "",
        totalStudents: "",
        totalFaculty: "",
        website: "",
        description: "",
        address: "",
        state: "",
        city: "",
        pincode: "",
        adminName: "",
        adminDesignation: "",
        email: "",
        phone: "",
        alternatePhone: "",
        recognitionType: "",
        courses: "",
        infrastructure: "",
      });
      setDocuments([]);
      setErrors({});
    } catch (err) {
      console.error("Submission error:", err);
      setStatus("error");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl shadow-lg border p-6 bg-white text-gray-900 border-gray-200">
      <h3 className="text-2xl font-semibold mb-4">Request to Register</h3>
      <p className="text-sm text-gray-600 mb-4">Fill this form to request your college registration. Provide the supporting documents for faster review.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">College Name *</label>
            <input name="collegeName" value={form.collegeName} onChange={handleChange} className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.collegeName ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.collegeName && <p className="text-red-500 text-xs mt-1">{errors.collegeName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">College Type *</label>
            <select name="collegeType" value={form.collegeType} onChange={handleChange} className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.collegeType ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Select college type</option>
              <option value="engineering">Engineering</option>
              <option value="medical">Medical</option>
              <option value="arts">Arts & Science</option>
              <option value="commerce">Commerce</option>
              <option value="law">Law</option>
              <option value="management">Management</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="agriculture">Agriculture</option>
              <option value="other">Other</option>
            </select>
            {errors.collegeType && <p className="text-red-500 text-xs mt-1">{errors.collegeType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Established Year *</label>
            <input type="number" name="establishedYear" value={form.establishedYear} onChange={handleChange} min="1800" max={new Date().getFullYear()} className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.establishedYear ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.establishedYear && <p className="text-red-500 text-xs mt-1">{errors.establishedYear}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Affiliation/University *</label>
            <input name="affiliation" value={form.affiliation} onChange={handleChange} className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.affiliation ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.affiliation && <p className="text-red-500 text-xs mt-1">{errors.affiliation}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Recognition Type *</label>
            <select name="recognitionType" value={form.recognitionType} onChange={handleChange} className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.recognitionType ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Select recognition type</option>
              <option value="ugc">UGC Recognized</option>
              <option value="aicte">AICTE Approved</option>
              <option value="naac">NAAC Accredited</option>
              <option value="state">State Government Recognized</option>
              <option value="deemed">Deemed University</option>
              <option value="private">Private University</option>
              <option value="other">Other</option>
            </select>
            {errors.recognitionType && <p className="text-red-500 text-xs mt-1">{errors.recognitionType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Total Students</label>
            <input type="number" name="totalStudents" value={form.totalStudents} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md" min="0" />
          </div>

          <div>
            <label className="block text-sm font-medium">Total Faculty</label>
            <input type="number" name="totalFaculty" value={form.totalFaculty} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md" min="0" />
          </div>

          <div>
            <label className="block text-sm font-medium">Website</label>
            <input type="url" name="website" value={form.website} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md" placeholder="https://" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Courses Offered</label>
            <textarea name="courses" value={form.courses} onChange={handleChange} rows={2} className="mt-1 w-full px-3 py-2 border rounded-md" placeholder="List the main courses/programs offered" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium">College Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="mt-1 w-full px-3 py-2 border rounded-md" placeholder="Brief description about the college" />
          </div>
        </div>

        {/* Address */}
        <div>
          <h4 className="text-lg font-medium mt-4">Address Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Full Address *</label>
              <textarea name="address" value={form.address} onChange={handleChange} rows={3} className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">State *</label>
              <input name="state" value={form.state} onChange={handleChange} className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.state ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">City *</label>
              <input name="city" value={form.city} onChange={handleChange} className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Pincode *</label>
              <input name="pincode" value={form.pincode} onChange={handleChange} maxLength={6} className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
            </div>
          </div>
        </div>

        {/* Admin Contact */}
        <div>
          <h4 className="text-lg font-medium mt-4">Administrative Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium">Admin Name *</label>
              <input name="adminName" value={form.adminName} onChange={handleChange} className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.adminName ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.adminName && <p className="text-red-500 text-xs mt-1">{errors.adminName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Designation *</label>
              <input name="adminDesignation" value={form.adminDesignation} onChange={handleChange} className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.adminDesignation ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.adminDesignation && <p className="text-red-500 text-xs mt-1">{errors.adminDesignation}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Email Address *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Phone Number *</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Alternate Phone Number</label>
              <input type="tel" name="alternatePhone" value={form.alternatePhone} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Infrastructure Details</label>
              <textarea name="infrastructure" value={form.infrastructure} onChange={handleChange} rows={2} className="mt-1 w-full px-3 py-2 border rounded-md" placeholder="Brief description of college infrastructure" />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div>
          <label className="block text-sm font-medium">Supporting Documents (multiple allowed)</label>
          <input type="file" multiple onChange={handleFiles} className="mt-2" />
          {documents.length > 0 && (
            <div className="mt-2 space-y-1">
              {documents.map((f, i) => (
                <div key={i} className="text-sm text-gray-700">{f.name}</div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 mt-4">
          <button type="submit" disabled={status === "loading"} className="rounded-md px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
            {status === "loading" ? "Sending..." : "Request Access"}
          </button>

          {status === "success" && <span className="text-green-600">Request submitted successfully! Our team will review it soon.</span>}
          {status === "error" && <span className="text-red-600">Submission failed. Please try again.</span>}
        </div>
      </form>
    </div>
  );
}
