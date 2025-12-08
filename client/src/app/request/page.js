import React from 'react'
import RequestRegisterForm from '../../components/RequestRegisterForm'
import Link from 'next/link'

export const metadata = {
  title: 'Request to Register — BUDDHI',
}

export default function RequestPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Request to Register</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">Back to Home</Link>
        </div>

        <RequestRegisterForm />
      </div>
    </main>
  )
}
