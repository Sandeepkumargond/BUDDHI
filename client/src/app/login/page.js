"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { showToast } from "@/lib/toast";
import { useAuth } from "@/context/AuthContext";
import AutoFillLogin from "@/components/AutoFillLogin";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student", // Default role
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const credentials = {
        email: formData.email,
        password: formData.password,
      };

      // For superadmin, also send username field (your backend checks both)
      if (formData.role === 'superadmin') {
        credentials.username = formData.email; // Assuming email can be used as username
      }

      const result = await login(formData.role, credentials);

      if (result.success) {
        showToast.success("Login successful! Redirecting...");
        
        // Redirect based on role
        const dashboardRoutes = {
          'superadmin': '/superadmin',
          'admin': '/admin',
          'subadmin': '/subadmin',
          'student': '/student',
          'faculty': '/faculty',
          'alumni': '/alumni'
        };
        
        const redirectPath = dashboardRoutes[formData.role] || '/dashboard';
        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
      } else {
        setError(result.error || "Login failed. Please try again.");
        showToast.error(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      showToast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFill = (preset) => {
    if (!preset) return;
    const { email, password, role } = preset;
    setFormData((prev) => ({
      ...prev,
      email: email || prev.email,
      password: password || prev.password,
      role: role || prev.role,
    }));
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="flex justify-center flex-col items-center">
        {/* <Image src="/logo 1.png" alt="star logo" width={50} height={50} /> */}
        <h2 className="mt-6 text-center text-2xl leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">
                Login as
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="alumni">Alumni</option>
                <option value="subadmin">Sub Admin</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 border border-black justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-white transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>

              <AutoFillLogin role={formData.role} onFill={handleAutoFill} />
            </div>

            <div className="text-center">
              <Link href="/forgot-password" className="text-sm leading-6 text-black hover:text-gray-900">
                Forgot password?
              </Link>
            </div>
          </form>

            <p className="mt-10 text-center text-sm text-gray-500">
              Not a member?{" "}
              <Link href="/request" className="font-semibold leading-6 text-black hover:text-gray-900">
                Register your institute
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }