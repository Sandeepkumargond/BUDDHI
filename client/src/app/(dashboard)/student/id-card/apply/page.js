"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { apiService } from "@/lib/api";
import { FiUpload, FiX } from "react-icons/fi";

export default function ApplyIdCard() {
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    bloodGroup: "",
    fatherName: "",
    motherName: "",
    phone: "",
    email: "",
    permanentAddress: "",
    course: "",
    branch: "",
    semester: 1,
    academicYear: "",
    photoUrl: "",
    signatureUrl: ""
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);

  useEffect(() => {
    fetchFormAndProfile();
  }, []);

  const fetchFormAndProfile = async () => {
    try {
      const [formResponse, profileResponse] = await Promise.all([
        apiService.request("/id-card-student/form/active", { method: "GET" }),
        apiService.request("/student/profile", { method: "GET" })
      ]);

      setForm(formResponse.data.form);
      const profile = profileResponse.data.student;
      setStudentProfile(profile);

      // Pre-fill form data from student profile
      setFormData({
        ...formData,
        fullName: `${profile.firstName} ${profile.lastName}`,
        dateOfBirth: profile.dateOfBirth?.split('T')[0] || "",
        email: profile.email || "",
        phone: profile.phone || "",
        course: profile.course || "",
        branch: profile.branch || "",
        semester: profile.semester || 1,
        academicYear: formResponse.data.form.academicYear,
        fatherName: profile.fatherName || "",
        motherName: profile.motherName || "",
        permanentAddress: profile.permanentAddress || "",
        bloodGroup: profile.bloodGroup || ""
      });
    } catch (error) {
      showToast.error("Failed to load form");
      router.push("/student/id-card");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = async (file, type) => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await apiService.request('/student/upload-document', {
        method: 'POST',
        body: uploadFormData
      });

      if (type === 'photo') {
        setFormData({ ...formData, photoUrl: response.data.url });
        showToast.success("Photo uploaded successfully");
      } else if (type === 'signature') {
        setFormData({ ...formData, signatureUrl: response.data.url });
        showToast.success("Signature uploaded successfully");
      }
    } catch (error) {
      showToast.error(`Failed to upload ${type}`);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast.error("Photo size should be less than 2MB");
        return;
      }
      setPhotoFile(file);
      handleFileUpload(file, 'photo');
    }
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        showToast.error("Signature size should be less than 1MB");
        return;
      }
      setSignatureFile(file);
      handleFileUpload(file, 'signature');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.photoUrl || !formData.signatureUrl) {
      showToast.error("Please upload photo and signature");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.request("/id-card-student/apply", {
        method: "POST",
        body: {
          formId: form._id,
          ...formData
        }
      });

      showToast.success("Application submitted successfully! Your ID card will be processed.");
      setTimeout(() => {
        router.push("/student/id-card");
      }, 1500);
    } catch (error) {
      showToast.error(error.message || "Failed to submit application");
    } finally {
      setIsLoading(false);
    }
  };

  if (!form) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show application form
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ID Card Application Form</h1>
        <p className="text-gray-600">{form.title} - {form.academicYear}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Personal Information */}
        <div>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Father's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mother's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permanent Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                min="1"
                max="10"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                required
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Documents Upload */}
        <div>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Upload Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passport Size Photo <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">Max size: 2MB, Format: JPG, PNG</p>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                {formData.photoUrl ? (
                  <div className="relative">
                    <img
                      src={formData.photoUrl}
                      alt="Photo"
                      className="w-32 h-32 object-cover mx-auto rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photoUrl: "" })}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <FiUpload className="mx-auto text-gray-400" size={32} />
                    <p className="text-sm text-gray-600 mt-2">Click to upload photo</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signature <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">Max size: 1MB, Format: JPG, PNG</p>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                {formData.signatureUrl ? (
                  <div className="relative">
                    <img
                      src={formData.signatureUrl}
                      alt="Signature"
                      className="w-32 h-16 object-contain mx-auto"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, signatureUrl: "" })}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <FiUpload className="mx-auto text-gray-400" size={32} />
                    <p className="text-sm text-gray-600 mt-2">Click to upload signature</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !formData.photoUrl || !formData.signatureUrl}
            className="flex-1 px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isLoading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  );
}
