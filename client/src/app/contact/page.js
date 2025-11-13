"use client";
import React, { useContext, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const { theme } = useContext(ThemeContext);

  // Form state
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);

  const scriptURL = process.env.NEXT_PUBLIC_CONTACT_SCRIPT_URL || "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("message", form.message);

      await fetch(scriptURL, { method: "POST", mode: "no-cors", body: formData });
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const subText = theme === "dark" ? "text-muted-foreground" : "text-gray-700";

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-linear-to-b from-black via-gray-900 to-gray-800"
          : "bg-linear-to-br from-white via-gray-100 to-blue-50"
      }`}
    >
      <Card
        className={`w-full max-w-xl rounded-2xl shadow-lg border ${
          theme === "dark"
            ? "bg-card text-card-foreground border-border"
            : "bg-white text-foreground"
        }`}
      >
        <CardHeader>
          <CardTitle className="text-center text-3xl font-extrabold">
            📬 Contact Us
          </CardTitle>
          <p className={`text-center mt-2 ${subText}`}>
            We’d love to hear from you. Fill out the form below to reach us.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Your Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Type your message..."
                rows={5}
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="mt-2 text-lg font-semibold"
              disabled={!scriptURL || status === "loading"}
            >
              {status === "loading"
                ? "Sending..."
                : !scriptURL
                ? "Unavailable"
                : "Send Message →"}
            </Button>

            {/* Status messages */}
            {status === "success" && (
              <p className="text-green-500 text-center mt-2">
                ✅ Message sent successfully!
              </p>
            )}
            {status === "error" && (
              <p className="text-red-500 text-center mt-2">
                ❌ Something went wrong. Try again.
              </p>
            )}
          </form>

          {/* Contact info */}
          <div className={`text-center text-sm mt-10 ${subText}`}>
            <p>📧 info@buddhiarchives.com</p>
            <p>📞 +91 98765 43210</p>
            <p>📍 NIT Patna, Bihar, India</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
