"use client";
import { useState } from "react";
import Link from "next/link";

const CollegeRegisterPage = () => {
  const [formData, setFormData] = useState({
    // College Information
    collegeName: "",
    collegeType: "",
    establishedYear: "",
    affiliation: "",
    totalStudents: "",
    totalFaculty: "",
    website: "",
    description: "",
    
    // Address Information
    address: "",
    state: "",
    city: "",
    pincode: "",
    
    // Admin Information
    adminName: "",
    adminDesignation: "",
    email: "",
    phone: "",
    alternatePhone: "",
    
    // Additional Information
    recognitionType: "",
    courses: "",
    infrastructure: "",
    
    // Agreement
    agreeToTerms: false,
    dataConsent: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    const requiredFields = {
      collegeName: "College name is required",
      collegeType: "College type is required",
      establishedYear: "Established year is required",
      affiliation: "Affiliation is required",
      address: "Address is required",
      state: "State is required",
      city: "City is required",
      pincode: "Pincode is required",
      adminName: "Admin name is required",
      adminDesignation: "Admin designation is required",
      email: "Email is required",
      phone: "Phone number is required",
      recognitionType: "Recognition type is required"
    };

    Object.keys(requiredFields).forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = requiredFields[field];
      }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/[^\d]/g, ''))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    // Pincode validation
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit pincode";
    }

    // Established year validation
    const currentYear = new Date().getFullYear();
    if (formData.establishedYear && (formData.establishedYear < 1800 || formData.establishedYear > currentYear)) {
      newErrors.establishedYear = `Please enter a valid year between 1800 and ${currentYear}`;
    }

    // Agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    if (!formData.dataConsent) {
      newErrors.dataConsent = "You must consent to data processing";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call to submit registration request
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would make the actual API call
      console.log("Registration data:", formData);
      
      setSubmitSuccess(true);
      
    } catch (error) {
      alert("Error submitting registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Registration Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your college registration request has been submitted successfully. 
            Our team will review your application and get back to you within 2-3 business days.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              We'll send updates to: <span className="font-medium">{formData.email}</span>
            </p>
            <Link 
              href="/sign-in"
              className="inline-block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">College Registration</h1>
          <p className="text-gray-600">Register your college to join our education management platform</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border">
          {/* College Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">College Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Name *
                </label>
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.collegeName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your college name"
                />
                {errors.collegeName && <p className="text-red-500 text-xs mt-1">{errors.collegeName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Type *
                </label>
                <select
                  name="collegeType"
                  value={formData.collegeType}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.collegeType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Established Year *
                </label>
                <input
                  type="number"
                  name="establishedYear"
                  value={formData.establishedYear}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.establishedYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 2005"
                  min="1800"
                  max={new Date().getFullYear()}
                />
                {errors.establishedYear && <p className="text-red-500 text-xs mt-1">{errors.establishedYear}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Affiliation/University *
                </label>
                <input
                  type="text"
                  name="affiliation"
                  value={formData.affiliation}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.affiliation ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., University of Mumbai"
                />
                {errors.affiliation && <p className="text-red-500 text-xs mt-1">{errors.affiliation}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recognition Type *
                </label>
                <select
                  name="recognitionType"
                  value={formData.recognitionType}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.recognitionType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Students (Approximate)
                </label>
                <input
                  type="number"
                  name="totalStudents"
                  value={formData.totalStudents}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Faculty (Approximate)
                </label>
                <input
                  type="number"
                  name="totalFaculty"
                  value={formData.totalFaculty}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 150"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.yourcollege.edu"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Courses Offered
                </label>
                <textarea
                  name="courses"
                  value={formData.courses}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List the main courses/programs offered by your college"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description about your college, its mission, and achievements"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter complete address with landmarks"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Maharashtra"
                />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Mumbai"
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.pincode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 400001"
                  maxLength="6"
                />
                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
              </div>
            </div>
          </div>

          {/* Admin Contact Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Administrative Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Name *
                </label>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.adminName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Full name of the admin"
                />
                {errors.adminName && <p className="text-red-500 text-xs mt-1">{errors.adminName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation *
                </label>
                <input
                  type="text"
                  name="adminDesignation"
                  value={formData.adminDesignation}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.adminDesignation ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Principal, Director, etc."
                />
                {errors.adminDesignation && <p className="text-red-500 text-xs mt-1">{errors.adminDesignation}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="admin@yourcollege.edu"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+91 9876543210"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternate Phone Number
                </label>
                <input
                  type="tel"
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 9876543211"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Infrastructure Details
                </label>
                <textarea
                  name="infrastructure"
                  value={formData.infrastructure}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of college infrastructure (labs, library, hostels, etc.)"
                />
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Terms and Conditions</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <label className="ml-3 block text-sm text-gray-700">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                    Privacy Policy
                  </Link>
                  . I understand that this information will be used to create our college account on the platform.
                </label>
              </div>
              {errors.agreeToTerms && <p className="text-red-500 text-xs">{errors.agreeToTerms}</p>}

              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="dataConsent"
                  checked={formData.dataConsent}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <label className="ml-3 block text-sm text-gray-700">
                  I consent to the processing of the provided data for account creation and platform usage. 
                  I understand that this data will be reviewed by the super admin for verification purposes.
                </label>
              </div>
              {errors.dataConsent && <p className="text-red-500 text-xs">{errors.dataConsent}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 mt-8">
              <Link
                href="/sign-in"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back to Sign In
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting Request..." : "Submit Registration Request"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollegeRegisterPage;
