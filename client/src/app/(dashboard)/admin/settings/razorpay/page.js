
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
			const res = await fetch((process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") + "/api/v1/razorpay/credentials/test", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" }
			})
			const payload = await res.json()
			if (!payload?.success) throw new Error(payload?.message || "Test failed")
			alert("Credentials validated: able to create an order on Razorpay")
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
				<div className="mb-4 text-sm text-green-700 bg-green-100 p-2 rounded">Saved successfully</div>
			)}

			{error && (
				<div className="mb-4 text-sm text-red-700 bg-red-100 p-2 rounded">{error}</div>
			)}

			<form onSubmit={handleSave} className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Key ID</label>
					<input
						value={keyId}
						onChange={(e) => setKeyId(e.target.value)}
						className="w-full px-3 py-2 border rounded"
						placeholder="rzp_test_..."
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Key Secret</label>
					<input
						value={keySecret}
						onChange={(e) => setKeySecret(e.target.value)}
						className="w-full px-3 py-2 border rounded"
						placeholder="secret"
						type="password"
					/>
					<div className="text-xs text-gray-500 mt-1">Leave blank to keep existing secret.</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret (optional)</label>
					<input
						value={webhookSecret}
						onChange={(e) => setWebhookSecret(e.target.value)}
						className="w-full px-3 py-2 border rounded"
						placeholder="webhook secret"
						type="password"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
					<select value={mode} onChange={(e) => setMode(e.target.value)} className="px-3 py-2 border rounded">
						<option value="test">Test</option>
						<option value="live">Live</option>
					</select>
				</div>

				<div className="flex justify-between items-center">
					<div className="flex gap-2">
						<button type="button" onClick={handleTest} className="bg-green-600 text-white px-4 py-2 rounded">Test Credentials</button>
						<button type="button" onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">Delete Credentials</button>
					</div>
					<div>
						<button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
					</div>
				</div>
			</form>
		</div>
	)
}


















