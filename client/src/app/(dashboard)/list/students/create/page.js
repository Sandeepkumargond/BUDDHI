"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
  const fileInputRef = useRef(null);

  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  const [form, setForm] = useState({
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
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateRandomAvatar = () => {
    const index = Math.floor(Math.random() * avatarList.length);
    return avatarList[index];
  };

  /* -----------------------------------------
      HANDLE IMAGE UPLOAD
  ------------------------------------------ */
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedPhoto(reader.result); // base64 preview
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
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

    // Use uploaded image OR fallback
    const finalPhoto = uploadedPhoto || generateRandomAvatar();

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
      photo: finalPhoto,
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

    // Save to localStorage (temporary "database")
    const existing = JSON.parse(localStorage.getItem("students") || "[]");
    existing.push(newStudent);
    localStorage.setItem("students", JSON.stringify(existing));

    alert("Student created successfully!");
    router.push("/list/students");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold ml-22 mb-6">Create New Student</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow-md rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* UPLOAD PHOTO SECTION */}
        <div className="col-span-1 md:col-span-2 flex flex-col items-center mb-3">
          <div className="w-24 h-24 rounded-full border-2 overflow-hidden mb-3">
            <Image
              src={uploadedPhoto || "/upload2.png"}
              alt="Profile"
              width={100}
              height={100}
              className="object-cover p-2 w-full h-full"
            />
          </div>

          <button
            type="button"
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm flex items-center gap-2"
            onClick={() => fileInputRef.current.click()}
          >
            <Image src="/upload.png" width={18} height={18} alt="upload" />
            Upload Photo
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        {/* FORM INPUTS */}
        <input
          type="text"
          name="enrolmentNo"
          placeholder="Enrollment No."
          value={form.enrolmentNo}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="text"
          name="rollNo"
          placeholder="Roll No."
          value={form.rollNo}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <select
          name="branch"
          value={form.branch}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Select Branch</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="MECH">MECH</option>
        </select>

        <input
          type="text"
          name="programme"
          placeholder="Programme (e.g., B.Tech)"
          value={form.programme}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="text"
          name="specialisation"
          placeholder="Specialisation"
          value={form.specialisation}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="email"
          name="personalEmail"
          placeholder="Personal Email"
          value={form.personalEmail}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="email"
          name="instituteEmail"
          placeholder="Institute Email"
          value={form.instituteEmail}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="text"
          name="mobile"
          placeholder="Mobile Number"
          value={form.mobile}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="col-span-1 md:col-span-2 bg-[#C3EBFA] hover:bg-[#A9DDF0] text-black font-semibold py-2 rounded"
        >
          Create Student
        </button>
      </form>
    </div>
  );
}
