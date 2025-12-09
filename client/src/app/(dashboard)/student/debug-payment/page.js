"use client";

import { useState } from "react";

export default function DebugPaymentPage() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const log = (msg) => {
    console.log(msg);
    setOutput((prev) => prev + "\n" + msg);
  };

  const testOrderCreation = async () => {
    setOutput("");
    setLoading(true);

    try {
      log("🔍 Testing Payment Order Creation");
      log("API Base: " + (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"));

      const url = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") + "/api/v1/razorpay/order";
      log("Request URL: " + url);

      const payload = {
        amount: 100,
        currency: "INR",
        receipt: `test_${Date.now()}`,
        notes: {
          feeHead: "Test Fee",
          session: "2024-25",
        },
      };

      log("Request payload: " + JSON.stringify(payload, null, 2));

      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      log("Response Status: " + response.status);
      log("Response Headers: " + JSON.stringify(Object.fromEntries(response.headers)));

      const data = await response.json();
      log("Response Body: " + JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        log("✅ SUCCESS! Order created: " + data.data.order.id);
        log("Razorpay Key ID: " + (data.data.keyId ? "✓ Present" : "✗ Missing"));
      } else {
        log("❌ FAILED!");
      }
    } catch (err) {
      log("❌ Error: " + err.message);
      log("Stack: " + err.stack);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔧 Payment Gateway Debug</h1>

        <button
          onClick={testOrderCreation}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 mb-6"
        >
          {loading ? "Testing..." : "Test Order Creation"}
        </button>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="font-semibold text-lg mb-4">Debug Output:</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto text-xs max-h-96 whitespace-pre-wrap break-words">
            {output || "Click 'Test Order Creation' to start..."}
          </pre>
        </div>

        <div className="mt-6 bg-blue-50 p-4 rounded border border-blue-200">
          <h3 className="font-semibold mb-2">🔍 Checklist:</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Open browser DevTools (F12)</li>
            <li>Go to Console tab</li>
            <li>Click "Test Order Creation"</li>
            <li>Check for error messages</li>
            <li>Verify Razorpay credentials are configured in Admin Settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
