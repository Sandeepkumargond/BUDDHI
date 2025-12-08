
"use client"

import { useState, useEffect } from "react"

export default function RazorpaySettingsPage() {
	const [keyId, setKeyId] = useState("")
	const [keySecret, setKeySecret] = useState("")
	const [webhookSecret, setWebhookSecret] = useState("")
	const [mode, setMode] = useState("test")
	const [saved, setSaved] = useState(false)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		let mounted = true
		async function fetchCreds() {
			try {
				setLoading(true)
				const res = await fetch((process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") + "/api/v1/razorpay/credentials", {
					method: "GET",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
				})
				const payload = await res.json()
				if (!mounted) return
				if (payload?.success && payload.data) {
					setKeyId(payload.data.keyId || "")
					setMode(payload.data.mode || "test")
				}
			} catch (err) {
				console.error(err)
				if (mounted) setError("Failed to load credentials")
			} finally {
				if (mounted) setLoading(false)
			}
		}
		fetchCreds()
		return () => { mounted = false }
	}, [])

	const handleSave = async (e) => {
		e.preventDefault()
		setError(null)
		try {
			const res = await fetch((process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") + "/api/v1/razorpay/credentials", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ keyId: keyId || null, keySecret: keySecret || null, webhookSecret: webhookSecret || null, mode })
			})
			const payload = await res.json()
			if (!payload?.success) throw new Error(payload?.message || "Save failed")
			setSaved(true)
			setKeySecret("")
			setWebhookSecret("")
			setTimeout(() => setSaved(false), 3000)
		} catch (err) {
			console.error(err)
			setError(err.message || "Failed to save")
		}
	}

	const handleTest = async () => {
		setError(null)
		try {
			// Validate inputs first
			if (!keyId || !keySecret) {
				throw new Error("Please enter both Key ID and Key Secret to test")
			}

			// Send credentials to test endpoint
			const res = await fetch((process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") + "/api/v1/razorpay/credentials/test", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ keyId, keySecret, mode }) // Send current form values
			})
			const payload = await res.json()
			if (!payload?.success) throw new Error(payload?.message || "Test failed")
			alert("✅ Credentials validated successfully!\n\nYou can now save these credentials.")
		} catch (err) {
			console.error(err)
			setError(err.message || "Test failed")
		}
	}

	const handleDelete = async () => {
		if (!confirm("Delete saved Razorpay credentials? This action cannot be undone.")) return
		setError(null)
		try {
			const res = await fetch((process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") + "/api/v1/razorpay/credentials", {
				method: "DELETE",
				credentials: "include",
				headers: { "Content-Type": "application/json" }
			})
			const payload = await res.json()
			if (!payload?.success) throw new Error(payload?.message || "Delete failed")
			setKeyId("")
			setKeySecret("")
			setWebhookSecret("")
			setMode("test")
			alert(payload.message || "Deleted")
		} catch (err) {
			console.error(err)
			setError(err.message || "Delete failed")
		}
	}

	if (loading) return <div className="p-4">Loading...</div>

	return (
		<div className="p-4 bg-white rounded-md">
			<h1 className="text-lg font-semibold mb-4">Razorpay Settings</h1>

			{saved && (
				<div className="mb-4 text-sm text-green-700 bg-green-100 p-2 rounded">✅ Saved successfully</div>
			)}

			{error && (
				<div className="mb-4 text-sm text-red-700 bg-red-100 p-3 rounded">❌ {error}</div>
			)}

			{/* Info Box */}
			<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
				<p className="text-sm text-blue-800">
					<strong>ℹ️ How to use:</strong><br/>
					1. Get your Razorpay credentials from <a href="https://dashboard.razorpay.com" target="_blank" className="underline">dashboard.razorpay.com</a><br/>
					2. Paste Key ID and Key Secret below<br/>
					3. Click "Test Credentials" to verify they work<br/>
					4. Click "Save" to store them securely
				</p>
			</div>

			<form onSubmit={handleSave} className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Key ID <span className="text-red-600">*</span></label>
					<input
						value={keyId}
						onChange={(e) => setKeyId(e.target.value)}
						className="w-full px-3 py-2 border rounded"
						placeholder="rzp_test_..."
						type="text"
					/>
					<div className="text-xs text-gray-500 mt-1">Example: rzp_test_1234567890</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Key Secret <span className="text-red-600">*</span></label>
					<input
						value={keySecret}
						onChange={(e) => setKeySecret(e.target.value)}
						className="w-full px-3 py-2 border rounded"
						placeholder="Your secret key"
						type="password"
					/>
					<div className="text-xs text-gray-500 mt-1">Leave blank to keep existing secret when updating.</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret <span className="text-gray-400 text-xs">(Optional)</span></label>
					<input
						value={webhookSecret}
						onChange={(e) => setWebhookSecret(e.target.value)}
						className="w-full px-3 py-2 border rounded"
						placeholder="webhook secret"
						type="password"
					/>
					<div className="text-xs text-gray-500 mt-1">Only needed if you're using webhooks</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
					<select value={mode} onChange={(e) => setMode(e.target.value)} className="px-3 py-2 border rounded">
						<option value="test">🧪 Test (Development)</option>
						<option value="live">🚀 Live (Production)</option>
					</select>
					<div className="text-xs text-gray-500 mt-1">Start with Test mode, switch to Live when ready for production</div>
				</div>

				<div className="flex justify-between items-center pt-4 border-t">
					<div className="flex gap-2">
						<button 
							type="button" 
							onClick={handleTest} 
							disabled={!keyId || !keySecret}
							className={`px-4 py-2 rounded font-medium transition-colors ${
								!keyId || !keySecret
									? "bg-gray-300 text-gray-600 cursor-not-allowed"
									: "bg-green-600 text-white hover:bg-green-700"
							}`}
						>
							✓ Test Credentials
						</button>
						<button 
							type="button" 
							onClick={handleDelete} 
							disabled={!keyId}
							className={`px-4 py-2 rounded font-medium transition-colors ${
								!keyId
									? "bg-gray-300 text-gray-600 cursor-not-allowed"
									: "bg-red-600 text-white hover:bg-red-700"
							}`}
						>
							🗑️ Delete
						</button>
					</div>
					<button 
						type="submit" 
						disabled={!keyId || !keySecret}
						className={`px-4 py-2 rounded font-medium transition-colors ${
							!keyId || !keySecret
								? "bg-gray-300 text-gray-600 cursor-not-allowed"
								: "bg-blue-600 text-white hover:bg-blue-700"
						}`}
					>
						💾 Save
					</button>
				</div>
			</form>
		</div>
	)
}


















