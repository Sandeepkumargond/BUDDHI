"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { role } from "@/lib/data";
import Image from "next/image";

// Random pexels avatars (Option B)
const avatarList = [
  "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
  "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
  "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
  "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg",
  "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
];

export default function CreateStudentPage() {
  const router = useRouter();

  // Different form states based on role
  const [form, setForm] = useState(
    role === "subadmin" 
      ? {
          // Subadmin only fills these fields
          firstName: "",
          lastName: "",
          personalEmail: "",
          programme: "",
          branch: "",
          specialisation: "",
          mobile: "",
          fatherMobile: "",
        }
      : {
          // Admin fills all fields (existing functionality)
          enrolmentNo: "",
          rollNo: "",
          firstName: "",
          lastName: "",
          branch: "",
          programme: "",
          specialisation: "",
          personalEmail: "",
          instituteEmail: "",
          mobile: "",
          password: "",
        }
  );

  const [generatedData, setGeneratedData] = useState({
    enrolmentNo: "",
    rollNo: "",
    instituteEmail: "",
    password: "",
  });

  const [showGeneratedData, setShowGeneratedData] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateRandomAvatar = () => {
    const index = Math.floor(Math.random() * avatarList.length);
    return avatarList[index];
  };

  // Generate enrollment number (format: 2024CSE001)
  const generateEnrollmentNo = (branch) => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 900) + 100; // 3-digit random number
    return `${year}${branch}${randomNum}`;
  };

  // Generate roll number (format: 24CSE001)
  const generateRollNo = (branch) => {
    const year = new Date().getFullYear().toString().slice(-2);
    const randomNum = Math.floor(Math.random() * 900) + 100; // 3-digit random number
    return `${year}${branch}${randomNum}`;
  };

  // Generate institute email (format: firstname.lastname@buddhicollege.edu)
  const generateInstituteEmail = (firstName, lastName) => {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@buddhicollege.edu`;
  };

  // Generate temporary password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Show toast notification
  const showToastNotification = (message, duration = 3000) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, duration);
  };

  // Simulate sending email
  const sendCredentialsEmail = (email, credentials) => {
    // In real implementation, this would call an API to send email
    console.log(`Sending credentials to ${email}:`, credentials);
    
    // Simulate email sending delay
    setTimeout(() => {
      setEmailSent(true);
      showToastNotification(`✅ Login credentials sent to ${email}`, 4000);
    }, 1000);
  };

  // Add student to the main student list (update the data source)
  const addToStudentList = (newStudent) => {
    // Add to localStorage
    const existing = JSON.parse(localStorage.getItem("students") || "[]");
    existing.push(newStudent);
    localStorage.setItem("students", JSON.stringify(existing));

    // Also try to update the main data source if available
    try {
      // This would update the main students data if imported
      const { studentsData } = require("@/lib/aryandata");
      if (studentsData && Array.isArray(studentsData)) {
        studentsData.push(newStudent);
      }
    } catch (error) {
      console.log("Main data source not available, using localStorage only");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (role === "subadmin") {
      // Subadmin validation - only required fields
      if (
        !form.firstName ||
        !form.lastName ||
        !form.personalEmail ||
        !form.programme ||
        !form.branch ||
        !form.specialisation ||
        !form.mobile ||
        !form.fatherMobile
      ) {
        alert("Please fill all the required fields");
        return;
      }

      // Generate automatic data
      const enrollmentNo = generateEnrollmentNo(form.branch);
      const rollNo = generateRollNo(form.branch);
      const instituteEmail = generateInstituteEmail(form.firstName, form.lastName);
      const password = generatePassword();

      const generated = {
        enrolmentNo: enrollmentNo,
        rollNo: rollNo,
        instituteEmail: instituteEmail,
        password: password,
      };

      setGeneratedData(generated);
      setShowGeneratedData(true);

      // Create final student object for subadmin
      const newStudent = {
        enrolmentNo: enrollmentNo,
        rollNo: rollNo,
        name: `${form.firstName} ${form.lastName}`,
        department: form.branch,
        programme: form.programme,
        specialisation: form.specialisation,
        email: instituteEmail,
        personalEmail: form.personalEmail,
        phone: form.mobile,
        fatherMobile: form.fatherMobile,
        class: "",
        semester: 1,
        photo: generateRandomAvatar(),
        password: password,
        admissionDate: new Date().toISOString().split('T')[0],
        status: "Active",
        feeStatus: "Pending",
        parentPhone: form.fatherMobile,

        // Empty fields for later completion
        dob: "",
        gender: "",
        bloodGroup: "",
        category: "",
        nationality: "",
        alternatePhone: "",
        currentAddress: "",
        permanentAddress: "",
        city: "",
        state: "",
        postalCode: "",
        mentor: "",
        cgpa: "",
        backlogs: "",
        idCardNo: "",
        libraryCardNo: "",
        hostel: "",
        scholarship: "",
        parentName: "",
        parentEmail: "",
        parentOccupation: "",
        aadhar: "",
        healthIssues: "",
        insurance: "",
      };

      // Add student to the list
      addToStudentList(newStudent);

      // Show success toast
      showToastNotification(`🎓 Student ${form.firstName} ${form.lastName} successfully registered!`);

      // Send credentials to student's personal email
      sendCredentialsEmail(form.personalEmail, generated);

      return;
    }

    // Admin validation - all fields required (existing functionality)
    if (
      !form.enrolmentNo ||
      !form.rollNo ||
      !form.firstName ||
      !form.lastName ||
      !form.branch ||
      !form.programme ||
      !form.specialisation ||
      !form.personalEmail ||
      !form.instituteEmail ||
      !form.mobile ||
      !form.password
    ) {
      alert("Please fill all the fields");
      return;
    }

    // Create final student object
    const newStudent = {
      enrolmentNo: form.enrolmentNo,
      rollNo: form.rollNo,
      name: `${form.firstName} ${form.lastName}`,
      department: form.branch,
      programme: form.programme,
      specialisation: form.specialisation,
      email: form.instituteEmail,
      personalEmail: form.personalEmail,
      phone: form.mobile,
      class: "",
      semester: "",
      photo: generateRandomAvatar(),
      password: form.password,

      // Empty fields for now (students will fill later)
      dob: "",
      gender: "",
      bloodGroup: "",
      category: "",
      nationality: "",
      alternatePhone: "",
      currentAddress: "",
      permanentAddress: "",
      city: "",
      state: "",
      postalCode: "",
      mentor: "",
      cgpa: "",
      backlogs: "",
      feeStatus: "",
      idCardNo: "",
      libraryCardNo: "",
      hostel: "",
      scholarship: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      parentOccupation: "",
      aadhar: "",
      healthIssues: "",
      insurance: "",
    };

    // Add student to the list
    addToStudentList(newStudent);

    // Show success toast
    showToastNotification(`🎓 Student ${form.firstName} ${form.lastName} created successfully!`);

    // Redirect after a short delay to show the toast
    setTimeout(() => {
      router.push("/list/students");
    }, 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {showToast && (
        <div 
          className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out"
          style={{
            animation: showToast ? 'slideInRight 0.3s ease-out' : 'slideOutRight 0.3s ease-in'
          }}
        >
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-80">
            <div className="shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium">{toastMessage}</p>
            </div>
            <button 
              onClick={() => setShowToast(false)}
              className="shrink-0 ml-4 text-green-200 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {role === "subadmin" ? "Student Admission Form" : "Create New Student"}
        </h1>
        {role === "subadmin" && (
          <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Subadmin - Admission Mode
          </div>
        )}
      </div>

      {/* Generated Data Display for Subadmin */}
      {role === "subadmin" && showGeneratedData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-800 mb-4">✅ Student Created Successfully!</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-3 rounded border">
              <label className="text-sm font-medium text-gray-600">Enrollment Number</label>
              <p className="font-semibold text-lg">{generatedData.enrolmentNo}</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <label className="text-sm font-medium text-gray-600">Roll Number</label>
              <p className="font-semibold text-lg">{generatedData.rollNo}</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <label className="text-sm font-medium text-gray-600">Institute Email ID</label>
              <p className="font-semibold">{generatedData.instituteEmail}</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <label className="text-sm font-medium text-gray-600">Temporary Password</label>
              <p className="font-semibold">{generatedData.password}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <div className="flex items-center mb-2">
              <Image src="/mail.png" alt="" width={20} height={20} className="mr-2" />
              <span className="font-medium text-blue-800">Email Status</span>
            </div>
            <p className="text-blue-700">
              {emailSent 
                ? `✅ Login credentials have been sent to ${form.personalEmail}` 
                : `📧 Sending login credentials to ${form.personalEmail}...`
              }
            </p>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => {
                setForm(role === "subadmin" ? {
                  firstName: "",
                  lastName: "",
                  personalEmail: "",
                  programme: "",
                  branch: "",
                  specialisation: "",
                  mobile: "",
                  fatherMobile: "",
                } : {});
                setShowGeneratedData(false);
                setEmailSent(false);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Another Student
            </button>
            <button
              onClick={() => router.push("/list/students")}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              View All Students
            </button>
          </div>
        </div>
      )}

      {/* Form - Show only if data not generated yet or if admin */}
      {(!showGeneratedData || role !== "subadmin") && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 shadow-md rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {role === "subadmin" && (
            <div className="col-span-1 md:col-span-2 mb-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">📝 Admission Instructions</h3>
                <p className="text-sm text-yellow-700">
                  Fill in the student's basic information below. The system will automatically generate:
                  Enrollment Number, Roll Number, Institute Email ID, and Temporary Password.
                  Login credentials will be sent to the student's personal email.
                </p>
              </div>
            </div>
          )}

          {/* Admin-only fields */}
          {role !== "subadmin" && (
            <>
              <input
                type="text"
                name="enrolmentNo"
                placeholder="Enrollment No."
                value={form.enrolmentNo || ""}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              <input
                type="text"
                name="rollNo"
                placeholder="Roll No."
                value={form.rollNo || ""}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </>
          )}

          {/* Common fields for both admin and subadmin */}
          <input
            type="text"
            name="firstName"
            placeholder="First Name *"
            value={form.firstName}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />

          <input
            type="text"
            name="lastName"
            placeholder="Last Name *"
            value={form.lastName}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />

          <input
            type="email"
            name="personalEmail"
            placeholder="Personal Email ID *"
            value={form.personalEmail}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />

          <select
            name="programme"
            value={form.programme}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          >
            <option value="">Select Programme *</option>
            <option value="B.Tech">B.Tech</option>
            <option value="M.Tech">M.Tech</option>
            <option value="BCA">BCA</option>
            <option value="MCA">MCA</option>
            <option value="MBA">MBA</option>
          </select>

          <select
            name="branch"
            value={form.branch}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          >
            <option value="">Select Branch *</option>
            <option value="CSE">Computer Science Engineering</option>
            <option value="ECE">Electronics & Communication</option>
            <option value="MECH">Mechanical Engineering</option>
            <option value="CIVIL">Civil Engineering</option>
            <option value="EEE">Electrical Engineering</option>
          </select>

          <input
            type="text"
            name="specialisation"
            placeholder="Specialisation *"
            value={form.specialisation}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />

          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number *"
            value={form.mobile}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />

          {/* Subadmin-specific field */}
          {role === "subadmin" && (
            <input
              type="tel"
              name="fatherMobile"
              placeholder="Father's Mobile Number *"
              value={form.fatherMobile}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
          )}

          {/* Admin-only fields */}
          {role !== "subadmin" && (
            <>
              <input
                type="email"
                name="instituteEmail"
                placeholder="Institute Email"
                value={form.instituteEmail || ""}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password || ""}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </>
          )}

          <button
            type="submit"
            className="col-span-1 md:col-span-2 bg-[#C3EBFA] hover:bg-[#A9DDF0] text-black font-semibold py-3 rounded-lg transition-colors"
          >
            {role === "subadmin" ? "Register Student for Admission" : "Create Student"}
          </button>
        </form>
      )}
    </div>
  );
}
