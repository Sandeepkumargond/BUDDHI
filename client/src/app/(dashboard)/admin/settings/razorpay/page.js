
"use client"

import { useState } from "react"

export default function RazorpaySettingsPage() {
	const [keyId, setKeyId] = useState("")
	const [keySecret, setKeySecret] = useState("")
	const [webhookSecret, setWebhookSecret] = useState("")
	const [mode, setMode] = useState("test")
	const [saved, setSaved] = useState(false)

	const handleSave = (e) => {
		e.preventDefault()
		// TODO: persist to backend
		setSaved(true)
		setTimeout(() => setSaved(false), 3000)
		console.log({ keyId, keySecret, webhookSecret, mode })
	}

	return (
		<div className="p-4 bg-white rounded-md">
			<h1 className="text-lg font-semibold mb-4">Razorpay Settings</h1>

			{saved && (
				<div className="mb-4 text-sm text-green-700 bg-green-100 p-2 rounded">Saved successfully</div>
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

				<div className="flex justify-end">
					<button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
				</div>
			</form>
		</div>
	)
}


















