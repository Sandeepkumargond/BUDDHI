"use client";

import { useState, useEffect } from "react";
import { toast } from "@/lib/toast";

export default function RazorpaySettings() {
  const [formData, setFormData] = useState({
    keyId: "",
    keySecret: "",
    webhookSecret: "",
    mode: "test",
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const res = await fetch(
        (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") +
          "/api/v1/razorpay/credentials",
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success && data.data) {
        setCredentials(data.data);
        setFormData({
          keyId: data.data.keyId || "",
          keySecret: "",
          webhookSecret: "",
          mode: data.data.mode || "test",
        });
      }
    } catch (err) {
      console.error("Failed to fetch credentials:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.keyId || !formData.keySecret) {
        toast.error("Key ID and Key Secret are required");
        setLoading(false);
        return;
      }

      const res = await fetch(
        (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") +
          "/api/v1/razorpay/credentials",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keyId: formData.keyId,
            keySecret: formData.keySecret,
            webhookSecret: formData.webhookSecret || undefined,
            mode: formData.mode,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Razorpay credentials saved successfully");
        setShowForm(false);
        fetchCredentials();
      } else {
        toast.error(data.message || "Failed to save credentials");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);

    try {
      if (!formData.keyId || !formData.keySecret) {
        toast.error("Key ID and Key Secret are required");
        setTesting(false);
        return;
      }

      const res = await fetch(
        (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") +
          "/api/v1/razorpay/credentials/test",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keyId: formData.keyId,
            keySecret: formData.keySecret,
            mode: formData.mode,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("✓ Credentials validated successfully!");
      } else {
        toast.error(
          "✗ Credentials validation failed: " +
            (data.message || "Invalid credentials")
        );
      }
    } catch (err) {
      console.error("Test error:", err);
      toast.error(err.message || "Failed to test credentials");
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete Razorpay credentials?")) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") +
          "/api/v1/razorpay/credentials",
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Credentials deleted successfully");
        setCredentials(null);
        setFormData({
          keyId: "",
          keySecret: "",
          webhookSecret: "",
          mode: "test",
        });
      } else {
        toast.error(data.message || "Failed to delete credentials");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Razorpay Configuration</h2>

      {credentials ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">
              Current Configuration
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-700">Key ID</p>
                <p className="font-mono text-sm">
                  {credentials.keyId?.substring(0, 20)}...
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Mode</p>
                <p className="font-semibold">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      credentials.mode === "test"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {credentials.mode?.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
            >
              {showForm ? "Cancel" : "Update Credentials"}
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 mb-4">
          No Razorpay credentials configured. Add them below.
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="space-y-4 mt-6 border-t pt-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Key ID (from Razorpay Dashboard)
            </label>
            <input
              type="text"
              name="keyId"
              value={formData.keyId}
              onChange={handleChange}
              placeholder="rzp_test_xxxxxx"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Found in Settings &gt; API Keys on Razorpay Dashboard
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Key Secret (from Razorpay Dashboard)
            </label>
            <input
              type="password"
              name="keySecret"
              value={formData.keySecret}
              onChange={handleChange}
              placeholder="Enter your secret key"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Keep this secret - never share it publicly
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Webhook Secret (Optional)
            </label>
            <input
              type="password"
              name="webhookSecret"
              value={formData.webhookSecret}
              onChange={handleChange}
              placeholder="Enter webhook secret if configured"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Found in Settings &gt; Webhooks on Razorpay Dashboard
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mode</label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="test">Test (for development)</option>
              <option value="live">Live (for production)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Use test mode for development. Key must start with rzp_test_ for
              test mode and rzp_live_ for live mode.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !formData.keyId || !formData.keySecret}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {testing ? "Testing..." : "Test Credentials"}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.keyId || !formData.keySecret}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Credentials"}
            </button>
          </div>
        </form>
      )}

      {!showForm && !credentials && (
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 w-full"
        >
          Add Razorpay Credentials
        </button>
      )}
    </div>
  );
}
