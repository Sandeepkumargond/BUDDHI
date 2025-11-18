// "use client";
// import React, { useContext, useState } from "react";
// import { ThemeContext } from "@/context/ThemeContext";

// export default function ContactPage() {
//   const { theme } = useContext(ThemeContext);

//   // Form state
//   const [form, setForm] = useState({ name: "", email: "", message: "" });
//   const [status, setStatus] = useState(null);

//   const scriptURL = process.env.NEXT_PUBLIC_CONTACT_SCRIPT_URL || "";

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus("loading");

//     try {
//       const formData = new FormData();
//       formData.append("name", form.name);
//       formData.append("email", form.email);
//       formData.append("message", form.message);

//       await fetch(scriptURL, { method: "POST", mode: "no-cors", body: formData });
//       setStatus("success");
//       setForm({ name: "", email: "", message: "" });
//     } catch {
//       setStatus("error");
//     }
//   };

//   const subText = theme === "dark" ? "text-muted-foreground" : "text-gray-700";

//   return (
//     <div
//       className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${
//         theme === "dark"
//           ? "bg-linear-to-b from-black via-gray-900 to-gray-800"
//           : "bg-linear-to-br from-white via-gray-100 to-blue-50"
//       }`}
//     >
//       <div
//         className={`w-full max-w-xl rounded-2xl shadow-lg border p-6 ${
//           theme === "dark"
//             ? "bg-gray-900 text-gray-100 border-gray-800"
//             : "bg-white text-gray-900 border-gray-200"
//         }`}
//       >
//         <header className="mb-4">
//           <h1 className="text-center text-3xl font-extrabold">📬 Contact Us</h1>
//           <p className={`text-center mt-2 ${subText}`}>
//             We’d love to hear from you. Fill out the form below to reach us.
//           </p>
//         </header>

//         <main>
//           <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
//             {/* Name */}
//             <div className="flex flex-col gap-2">
//               <label htmlFor="name" className="text-sm font-medium">
//                 Your Name
//               </label>
//               <input
//                 id="name"
//                 name="name"
//                 placeholder="Enter your name"
//                 value={form.name}
//                 onChange={handleChange}
//                 required
//                 className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
//                   theme === "dark"
//                     ? "bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-600"
//                     : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
//                 }`}
//               />
//             </div>

//             {/* Email */}
//             <div className="flex flex-col gap-2">
//               <label htmlFor="email" className="text-sm font-medium">
//                 Your Email
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 placeholder="Enter your email"
//                 value={form.email}
//                 onChange={handleChange}
//                 required
//                 className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
//                   theme === "dark"
//                     ? "bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-600"
//                     : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
//                 }`}
//               />
//             </div>

//             {/* Message */}
//             <div className="flex flex-col gap-2">
//               <label htmlFor="message" className="text-sm font-medium">
//                 Your Message
//               </label>
//               <textarea
//                 id="message"
//                 name="message"
//                 placeholder="Type your message..."
//                 rows={5}
//                 value={form.message}
//                 onChange={handleChange}
//                 required
//                 className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 resize-y ${
//                   theme === "dark"
//                     ? "bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-600"
//                     : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
//                 }`}
//               />
//             </div>

//             {/* Submit */}
//             <div className="flex flex-col items-center">
//               <button
//                 type="submit"
//                 className={`mt-2 w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-lg font-semibold transition-colors ${
//                   theme === "dark"
//                     ? "bg-blue-600 text-white hover:bg-blue-700"
//                     : "bg-blue-600 text-white hover:bg-blue-700"
//                 } ${!scriptURL || status === "loading" ? "opacity-60 cursor-not-allowed" : ""}`}
//                 disabled={!scriptURL || status === "loading"}
//               >
//                 {status === "loading"
//                   ? "Sending..."
//                   : !scriptURL
//                   ? "Unavailable"
//                   : "Send Message →"}
//               </button>

//               {/* Status messages */}
//               {status === "success" && (
//                 <p className="text-green-500 text-center mt-2">✅ Message sent successfully!</p>
//               )}
//               {status === "error" && (
//                 <p className="text-red-500 text-center mt-2">❌ Something went wrong. Try again.</p>
//               )}
//             </div>
//           </form>

//           {/* Contact info */}
//           <div className={`text-center text-sm mt-8 ${subText}`}>
//             <p>📧 info@buddhiarchives.com</p>
//             <p>📞 +91 98765 43210</p>
//             <p>📍 NIT Patna, Bihar, India</p>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page