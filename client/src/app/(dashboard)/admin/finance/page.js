"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { role } from "@/lib/data"
import { FaMoneyBillWave, FaChartLine, FaExclamationTriangle, FaPercentage } from 'react-icons/fa'
import { 
  financialSummary, 
  studentFeeRecords, 
  expenseRecords, 
  feeCategories,
  expenseCategories 
} from "@/lib/data"
import { apiService } from "@/lib/api"

const FinancePage = () => {
  const [feeRecords, setFeeRecords] = useState([])
  const [feeStructures, setFeeStructures] = useState([])
  const [paymentTransactions, setPaymentTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ department: "", status: "" })
  const [showFeeStructureModal, setShowFeeStructureModal] = useState(false)
  const [editingStructureId, setEditingStructureId] = useState(null)
  const [feeStructureForm, setFeeStructureForm] = useState({
    department: "",
    semester: "1",
    academicYear: "2024-25",
    category: "general",
    feeHeads: [
      { name: "Tuition Fee", amount: "" },
      { name: "Library Fee", amount: "" },
      { name: "Laboratory Fee", amount: "" }
    ],
    publishNow: true
  })

  // Fetch fee payment records from backend
  useEffect(() => {
    fetchFeeRecords()
    fetchFeeStructures()
    fetchPaymentTransactions()
  }, [])

  const fetchFeeRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") + "/api/v1/admin/student-fee-records",
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        }
      )
      
      if (!response.ok) throw new Error("Failed to fetch fee records")
      
      const data = await response.json()
      console.log("Student fee records response:", data)
      
      if (data.success && Array.isArray(data.data?.records)) {
        const normalized = data.data.records.map((r) => {
          const totalAmount = Number(r.totalAmount ?? r.amount ?? r.fee?.total ?? 0)
          const paidAmount = Number(r.paidAmount ?? r.paid ?? r.payment?.paidAmount ?? 0)
          const pendingAmount = Number(r.pendingAmount ?? (totalAmount - paidAmount))
          const status = r.status ?? r.paymentStatus ?? (paidAmount >= totalAmount ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Pending')
          return {
            firstName: r.firstName ?? r.student?.firstName ?? r.studentName?.split(' ')[0] ?? '',
            lastName: r.lastName ?? r.student?.lastName ?? r.studentName?.split(' ').slice(1).join(' ') ?? '',
            enrollmentNo: r.enrollmentNo ?? r.student?.enrollment ?? r.rollNo ?? r.studentEnrollment ?? '',
            branch: r.branch ?? r.department ?? r.program ?? 'N/A',
            totalAmount,
            paidAmount,
            pendingAmount: pendingAmount < 0 ? 0 : pendingAmount,
            status,
            dueDate: r.dueDate ?? r.fee?.dueDate ?? null,
          }
        })
        setFeeRecords(normalized)
      } else {
        console.log("No records found in response")
        setFeeRecords([])
      }
    } catch (err) {
      console.error("Error fetching fee records:", err)
      setError(err.message || "Failed to load fee records")
    } finally {
      setLoading(false)
    }
  }

  const fetchFeeStructures = async () => {
    try {
      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") + "/api/v1/admin/fee-structures",
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        }
      )
      
      if (!response.ok) throw new Error("Failed to fetch fee structures")
      
      const data = await response.json()
      console.log("Fee structures response:", data)
      
      if (data.success && data.data?.items) {
        console.log("Fee structures found:", data.data.items)
        setFeeStructures(data.data.items)
      } else {
        console.log("No fee structures found")
        setFeeStructures([])
      }
    } catch (err) {
      console.error("Error fetching fee structures:", err)
    }
  }

  const fetchPaymentTransactions = async () => {
    try {
      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") + "/api/v1/razorpay/admin/all-payments",
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        }
      )
      
      if (!response.ok) throw new Error("Failed to fetch payment transactions")
      
      const data = await response.json()
      console.log("Payment transactions response:", data)
      
      if (data.success && Array.isArray(data.data)) {
        console.log("Payment transactions found:", data.data.length)
        setPaymentTransactions(data.data)
      } else {
        console.log("No payment transactions found")
        setPaymentTransactions([])
      }
    } catch (err) {
      console.error("Error fetching payment transactions:", err)
      setPaymentTransactions([])
    }
  }

  // Filter records - only show payments for published fee structures
  const filteredRecords = feeRecords.filter(record => {
    if (filters.department && record.branch !== filters.department) return false
    if (filters.status && record.status !== filters.status) return false
    return true
  })

  // Filter payment transactions
  const filteredPayments = paymentTransactions.filter(payment => {
    if (filters.department && payment.branch !== filters.department) return false
    if (filters.status && payment.transactionStatus !== filters.status) return false
    return true
  })

  // Calculate summary stats from actual payment transactions
  const totalCollectedFromPayments = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const successfulPayments = filteredPayments.filter(p => p.transactionStatus === 'success').length
  const pendingPayments = filteredPayments.filter(p => p.transactionStatus === 'pending').length
  const failedPayments = filteredPayments.filter(p => p.transactionStatus === 'failed').length
  
  // Fallback to fee records if no payment transactions
  const totalCollected = paymentTransactions.length > 0 ? totalCollectedFromPayments : filteredRecords.reduce((sum, r) => sum + (r.paidAmount || 0), 0)
  const totalPending = filteredRecords.reduce((sum, r) => sum + (r.pendingAmount || 0), 0)
  const totalExpected = filteredRecords.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
  
  const collectionRate = totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : 0

  const handleAddFeeStructure = async (e) => {
    e.preventDefault()
    try {
      const url = editingStructureId
        ? `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"}/api/v1/admin/fee-structure/${editingStructureId}`
        : `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"}/api/v1/admin/fee-structure`
      
      const method = editingStructureId ? "PATCH" : "POST"
      
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch: feeStructureForm.department,
          semester: parseInt(feeStructureForm.semester),
          session: feeStructureForm.academicYear,
          category: feeStructureForm.category,
          feeHeads: feeStructureForm.feeHeads,
          published: feeStructureForm.publishNow
        })
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.message || "Failed to save fee structure")
      
      alert(editingStructureId ? "Fee structure updated successfully!" : "Fee structure created successfully!")
      setShowFeeStructureModal(false)
      setEditingStructureId(null)
      setFeeStructureForm({
        department: "",
        semester: "1",
        academicYear: "2024-25",
        category: "general",
        feeHeads: [
          { name: "Tuition Fee", amount: "" },
          { name: "Library Fee", amount: "" },
          { name: "Laboratory Fee", amount: "" }
        ],
        publishNow: true
      })
      fetchFeeStructures()
    } catch (err) {
      alert("Error: " + (err.message || "Failed to save fee structure"))
    }
  }

  const handleEditFeeStructure = (structure) => {
    setEditingStructureId(structure._id)
    setFeeStructureForm({
      department: structure.branch,
      semester: String(structure.semester),
      academicYear: structure.session,
      category: structure.category,
      feeHeads: structure.feeHeads,
      publishNow: structure.published
    })
    setShowFeeStructureModal(true)
  }

  const handleDeleteFeeStructure = async (id) => {
    if (!confirm("Are you sure you want to delete this fee structure?")) return
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"}/api/v1/admin/fee-structure/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        }
      )

      const data = await response.json()
      if (!data.success) throw new Error(data.message || "Failed to delete fee structure")
      
      alert("Fee structure deleted successfully!")
      fetchFeeStructures()
    } catch (err) {
      alert("Error: " + (err.message || "Failed to delete fee structure"))
    }
  }

  const handleAddFeeHead = () => {
    setFeeStructureForm(prev => ({
      ...prev,
      feeHeads: [...prev.feeHeads, { name: "", amount: "" }]
    }))
  }

  const handleRemoveFeeHead = (index) => {
    setFeeStructureForm(prev => ({
      ...prev,
      feeHeads: prev.feeHeads.filter((_, i) => i !== index)
    }))
  }

  const handleFeeHeadChange = (index, field, value) => {
    setFeeStructureForm(prev => {
      const newHeads = [...prev.feeHeads]
      newHeads[index] = { ...newHeads[index], [field]: value }
      return { ...prev, feeHeads: newHeads }
    })
  }

  const exportToCSV = () => {
    // Use payment transactions for CSV export (actual payment data)
    const dataToExport = paymentTransactions.length > 0 ? paymentTransactions : filteredRecords
    
    if (dataToExport.length === 0) {
      alert("No payment records to export")
      return
    }

    // If exporting payment transactions (real payment data)
    if (paymentTransactions.length > 0) {
      const headers = ["Payment ID", "Student Name", "Roll No", "Enrollment No", "Branch", "Session", "Fee Head", "Amount (₹)", "Transaction ID", "Payment Mode", "Status", "Transaction Date"]
      const csvContent = [
        headers.join(","),
        ...paymentTransactions.map(p => [
          p.id || "N/A",
          `"${p.studentName || "N/A"}"`,
          p.rollNo || "N/A",
          p.enrollmentNo || "N/A",
          `"${p.branch || "N/A"}"`,
          `"${p.session || "N/A"}"`,
          `"${p.feeHead || "N/A"}"`,
          p.amount || 0,
          p.transactionId || "N/A",
          p.paymentMode || "N/A",
          p.transactionStatus || "N/A",
          p.transactionDate ? new Date(p.transactionDate).toLocaleDateString() : (p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A")
        ].join(","))
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `payment-transactions-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      window.URL.revokeObjectURL(url)
    } else {
      // Fallback: Export fee records (student fee structure data)
      const headers = ["Student Name", "Enrollment No", "Branch", "Total Amount (₹)", "Paid Amount (₹)", "Pending Amount (₹)", "Status", "Due Date"]
      const csvContent = [
        headers.join(","),
        ...filteredRecords.map(r => [
          `"${r.firstName || ""} ${r.lastName || ""}"`,
          r.enrollmentNo || "N/A",
          `"${r.branch || "N/A"}"`,
          r.totalAmount || 0,
          r.paidAmount || 0,
          r.pendingAmount || 0,
          r.status || "N/A",
          r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "N/A"
        ].join(","))
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `fee-records-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      window.URL.revokeObjectURL(url)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading fee records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Finance Management</h1>
          <p className="text-gray-600">Manage fee collections and payments</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Fee Management Section */}
        <div className="space-y-6">
          {/* Header with Actions */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">Fee Management</h2>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingStructureId(null)
                  setFeeStructureForm({
                    department: "",
                    semester: "1",
                    academicYear: "2024-25",
                    category: "general",
                    feeHeads: [
                      { name: "Tuition Fee", amount: "" },
                      { name: "Library Fee", amount: "" },
                      { name: "Laboratory Fee", amount: "" }
                    ],
                    publishNow: true
                  })
                  setShowFeeStructureModal(true)
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Add Fee Structure
              </button>
              <button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Fee Structures Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Fee Structures</h3>
            </div>
            {feeStructures.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700">Department</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Semester</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Academic Year</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Category</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Total Amount</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeStructures.map((structure) => {
                      const totalAmount = (structure.feeHeads || []).reduce((sum, head) => sum + (parseInt(head.amount) || 0), 0)
                      return (
                        <tr key={structure._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                          <td className="p-4 font-medium text-gray-800">{structure.branch || "N/A"}</td>
                          <td className="p-4 text-gray-600">Sem {structure.semester}</td>
                          <td className="p-4 text-gray-600">{structure.session}</td>
                          <td className="p-4 text-gray-600 capitalize">{structure.category}</td>
                          <td className="p-4 font-semibold text-gray-800">₹{totalAmount.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              structure.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {structure.published ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="p-4 flex gap-2">
                            <button
                              onClick={() => handleEditFeeStructure(structure)}
                              className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition text-xs font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteFeeStructure(structure._id)}
                              className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-xs font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">No fee structures created yet</p>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Total Collected</h3>
              <p className="text-3xl font-bold text-green-600">₹{Number(totalCollected).toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">{successfulPayments} successful payments</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Pending Collection</h3>
              <p className="text-3xl font-bold text-red-600">₹{Number(totalPending).toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">From {filteredRecords.filter(r => (r.pendingAmount || 0) > 0).length} students</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Total Transactions</h3>
              <p className="text-3xl font-bold text-blue-600">{paymentTransactions.length}</p>
              <p className="text-sm text-gray-500 mt-2">{pendingPayments} pending, {failedPayments} failed</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Collection Rate</h3>
              <p className="text-3xl font-bold text-purple-600">{(totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : '0.0')}%</p>
              <p className="text-sm text-gray-500 mt-2">Overall efficiency</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex gap-4 flex-wrap items-center">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Programs</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MBA">MBA</option>
                  <option value="MCA">MCA</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <button
                onClick={() => setFilters({ department: "", status: "" })}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition mt-6"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Fee Records Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Student Fee Records</h3>
            </div>
            {filteredRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700">Student Details</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Department</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Total Amount</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Paid Amount</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Pending</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Due Date</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
                        <td className="p-4">
                          <div className="font-medium text-gray-800">{`${record.firstName} ${record.lastName}` || "N/A"}</div>
                          <div className="text-xs text-gray-500">{record.enrollmentNo || "N/A"}</div>
                        </td>
                        <td className="p-4 text-gray-600">{record.branch || "N/A"}</td>
                        <td className="p-4 font-semibold text-gray-800">₹{(record.totalAmount || 0).toLocaleString()}</td>
                        <td className="p-4 text-green-600 font-semibold">₹{(record.paidAmount || 0).toLocaleString()}</td>
                        <td className="p-4 text-red-600 font-semibold">₹{(record.pendingAmount || 0).toLocaleString()}</td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              record.status === 'Paid'
                                ? "bg-green-100 text-green-800"
                                : record.status === 'Partial'
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">
                          {record.dueDate
                            ? new Date(record.dueDate).toLocaleDateString('en-IN', { 
                              year: 'numeric', 
                              month: '2-digit', 
                              day: '2-digit' 
                            })
                            : 'N/A'}
                        </td>
                        <td className="p-4 flex gap-2">
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600 transition"
                            title="View details"
                          >
                            👁️
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600 transition"
                            title="Print"
                          >
                            🖨️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">No fee records found for published fee structures</p>
              </div>
            )}
          </div>

          {/* Payment Transactions Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Payment Transactions</h3>
                <p className="text-sm text-gray-500 mt-1">All successful payment records from students</p>
              </div>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {paymentTransactions.length} Transactions
              </span>
            </div>
            {paymentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700">Payment ID</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Student Name</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Roll No</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Fee Head</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Session</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Mode</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentTransactions.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                        <td className="p-4">
                          <div className="text-xs font-mono text-gray-600">{payment.id}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-800">{payment.studentName || "N/A"}</div>
                          <div className="text-xs text-gray-500">{payment.enrollmentNo || "N/A"}</div>
                        </td>
                        <td className="p-4 text-gray-600">{payment.rollNo || "N/A"}</td>
                        <td className="p-4 text-gray-800">{payment.feeHead || "N/A"}</td>
                        <td className="p-4 text-gray-600">{payment.session || "N/A"}</td>
                        <td className="p-4 font-semibold text-gray-800">₹{(payment.amount || 0).toLocaleString()}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                            {payment.paymentMode || "N/A"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              payment.transactionStatus === 'success'
                                ? "bg-green-100 text-green-800"
                                : payment.transactionStatus === 'pending'
                                ? "bg-yellow-100 text-yellow-800"
                                : payment.transactionStatus === 'failed'
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {payment.transactionStatus || "N/A"}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 text-xs">
                          {payment.transactionDate ? new Date(payment.transactionDate).toLocaleDateString() : (payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "N/A")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">No payment transactions recorded yet</p>
                <p className="text-sm text-gray-400 mt-1">Transactions will appear here when students make payments</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Fee Structure Modal */}
      {showFeeStructureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingStructureId ? "Edit Fee Structure" : "Add Fee Structure"}
              </h3>
              <button
                onClick={() => {
                  setShowFeeStructureModal(false)
                  setEditingStructureId(null)
                  setFeeStructureForm({
                    department: "",
                    semester: "1",
                    academicYear: "2024-25",
                    category: "general",
                    feeHeads: [
                      { name: "Tuition Fee", amount: "" },
                      { name: "Library Fee", amount: "" },
                      { name: "Laboratory Fee", amount: "" }
                    ],
                    publishNow: true
                  })
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFeeStructure} className="space-y-5">
              {/* Department */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Department</label>
                <select
                  value={feeStructureForm.department}
                  onChange={(e) =>
                    setFeeStructureForm({ ...feeStructureForm, department: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science & Engineering</option>
                  <option value="ECE">Electronics & Communication Engineering</option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="CE">Civil Engineering</option>
                  <option value="EE">Electrical Engineering</option>
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Semester</label>
                <select
                  value={feeStructureForm.semester}
                  onChange={(e) =>
                    setFeeStructureForm({ ...feeStructureForm, semester: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  required
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Academic Year</label>
                <select
                  value={feeStructureForm.academicYear}
                  onChange={(e) =>
                    setFeeStructureForm({ ...feeStructureForm, academicYear: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  required
                >
                  <option value="2024-25">2024-25</option>
                  <option value="2025-26">2025-26</option>
                  <option value="2026-27">2026-27</option>
                  <option value="2027-28">2027-28</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Category</label>
                <select
                  value={feeStructureForm.category}
                  onChange={(e) =>
                    setFeeStructureForm({ ...feeStructureForm, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  required
                >
                  <option value="general">General</option>
                  <option value="sc">SC</option>
                  <option value="st">ST</option>
                  <option value="obc">OBC</option>
                </select>
              </div>

              {/* Fee Categories */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">Fee Categories</label>
                <div className="space-y-3">
                  {feeStructureForm.feeHeads.map((head, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium">
                        {head.name}
                      </div>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={head.amount}
                        onChange={(e) => handleFeeHeadChange(idx, "amount", e.target.value)}
                        className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publishNow"
                  checked={feeStructureForm.publishNow}
                  onChange={(e) =>
                    setFeeStructureForm({ ...feeStructureForm, publishNow: e.target.checked })
                  }
                  className="rounded"
                />
                <label htmlFor="publishNow" className="text-sm text-gray-700">
                  Publish immediately
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeeStructureModal(false)
                    setEditingStructureId(null)
                    setFeeStructureForm({
                      department: "",
                      semester: "1",
                      academicYear: "2024-25",
                      category: "general",
                      feeHeads: [
                        { name: "Tuition Fee", amount: "" },
                        { name: "Library Fee", amount: "" },
                        { name: "Laboratory Fee", amount: "" }
                      ],
                      publishNow: true
                    })
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingStructureId ? "Update Fee Structure" : "Create Fee Structure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FinancePage
