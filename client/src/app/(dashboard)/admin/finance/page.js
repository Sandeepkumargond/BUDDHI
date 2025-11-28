"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { role } from "@/lib/data"
import { 
  financialSummary, 
  studentFeeRecords, 
  expenseRecords, 
  feeCategories,
  expenseCategories 
} from "@/lib/data"
import { apiService } from "@/lib/api"

const FinancePage = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedPeriod, setSelectedPeriod] = useState("2024-25")
  
  // Filter states
  const [feeFilters, setFeeFilters] = useState({ department: "", status: "" })
  const [expenseFilters, setExpenseFilters] = useState({ category: "", status: "" })
  
  // Modal states
  const [showFeeStructureModal, setShowFeeStructureModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  
  // Form states
  const [feeStructureForm, setFeeStructureForm] = useState({
    departmentCode: "",
    semester: 1,
    academicYear: "2024-25",
    fees: []
  })
  const [feeCategory, setFeeCategory] = useState("general")
  const [publishNow, setPublishNow] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState("")
  
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    categoryId: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    paymentMethod: "",
    vendor: "",
    invoiceNumber: ""
  })

  // Filter data based on selected period and filters
  const currentFeeRecords = studentFeeRecords
    .filter(record => record.academicYear === selectedPeriod)
    .filter(record => !feeFilters.department || record.department === feeFilters.department)
    .filter(record => !feeFilters.status || record.status === feeFilters.status)
    
  const currentExpenseRecords = expenseRecords
    .filter(expense => !expenseFilters.category || expense.categoryId.toString() === expenseFilters.category)
    .filter(expense => !expenseFilters.status || expense.status === expenseFilters.status)
    .slice(0, 10)

  // Export functionality
  const exportToCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(data[0]).join(",") + "\\n" +
      data.map(row => Object.values(row).join(",")).join("\\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${filename}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportData = () => {
    if (activeTab === "fees") {
      exportToCSV(currentFeeRecords, `fee-records-${selectedPeriod}`)
    } else if (activeTab === "expenses") {
      exportToCSV(currentExpenseRecords, `expense-records-${selectedPeriod}`)
    } else {
      // Export summary data
      const summaryData = [
        { metric: "Total Revenue", value: financialSummary.totalRevenue },
        { metric: "Total Expenses", value: financialSummary.totalExpenses },
        { metric: "Net Income", value: financialSummary.netIncome },
        { metric: "Pending Fees", value: financialSummary.totalPendingFees },
        { metric: "Collection Rate", value: financialSummary.collectionRate + "%" }
      ]
      exportToCSV(summaryData, `financial-summary-${selectedPeriod}`)
    }
    showToast.success("Data exported successfully!")
  }

  // Form handlers
  const handleAddFeeStructure = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitMsg("")
    try {
      const heads = (feeStructureForm.fees || [])
        .filter(f => typeof f.amount === 'number' && f.amount > 0)
        .map(f => {
          const cat = feeCategories.find(c => c.id === f.categoryId)
          return { name: cat?.name || `Category ${f.categoryId}`, amount: Number(f.amount) }
        })

      if (!feeStructureForm.departmentCode) throw new Error("Department is required")
      if (!feeStructureForm.academicYear) throw new Error("Academic year is required")
      if (heads.length === 0) throw new Error("Please enter at least one fee head amount")

      const payload = {
        branch: feeStructureForm.departmentCode,
        semester: Number(feeStructureForm.semester),
        session: feeStructureForm.academicYear,
        category: feeCategory,
        published: publishNow,
        feeHeads: heads,
      }

      const res = await apiService.adminCreateFeeStructure(payload)
      const msg = res?.message || "Fee structure added"
      setSubmitMsg(msg)
      showToast.success(msg)
      // Reset minimal state
      setFeeStructureForm({ departmentCode: "", semester: 1, academicYear: feeStructureForm.academicYear, fees: [] })
      setShowFeeStructureModal(false)
    } catch (err) {
      setSubmitMsg(err?.message || "Failed to add structure")
      showToast.error(err?.message || "Failed to add structure")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddExpense = (e) => {
    e.preventDefault()
    const newExpense = {
      id: Date.now(),
      ...expenseForm,
      amount: parseFloat(expenseForm.amount),
      status: "Pending",
      approvedBy: "System"
    }
    alert("Expense added successfully!")
    setShowExpenseModal(false)
    setExpenseForm({
      description: "",
      categoryId: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      paymentMethod: "",
      vendor: "",
      invoiceNumber: ""
    })
  }

  const handleCreateBudget = () => {
    showToast.success("Budget created successfully!")
    setShowBudgetModal(false)
  }

  const handleGenerateReport = (reportType) => {
    const reports = {
      "fee-collection": "Fee Collection Report generated successfully!",
      "expense-report": "Expense Report generated successfully!",
      "profit-loss": "Profit & Loss Statement generated successfully!",
      "outstanding-fees": "Outstanding Fees Report generated successfully!",
      "department-wise": "Department-wise Revenue Report generated successfully!",
      "cash-flow": "Cash Flow Report generated successfully!"
    }
    
    showToast.success(reports[reportType] || "Report generated successfully!")
    setShowReportModal(false)
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "/home.png" },
    { id: "fees", label: "Fee Management", icon: "/home.png" },
    { id: "expenses", label: "Expenses", icon: "/home.png" },
    { id: "budget", label: "Budget Planning", icon: "/home.png" },
    { id: "reports", label: "Reports", icon: "/home.png" },
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-500 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Revenue</p>
              <p className="text-2xl font-bold">₹{(financialSummary.totalRevenue / 100000).toFixed(1)}L</p>
            </div>
            <Image src="/home.png" alt="Revenue" width={40} height={40} className="opacity-80" />
          </div>
        </div>
        
        <div className="bg-green-500 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Net Income</p>
              <p className="text-2xl font-bold">₹{(financialSummary.netIncome / 100000).toFixed(1)}L</p>
            </div>
            <Image src="/profit.png" alt="Profit" width={40} height={40} className="opacity-80" />
          </div>
        </div>
        
        <div className="bg-red-500 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Pending Fees</p>
              <p className="text-2xl font-bold">₹{(financialSummary.totalPendingFees / 100000).toFixed(1)}L</p>
            </div>
            <Image src="/pending.png" alt="Pending" width={40} height={40} className="opacity-80" />
          </div>
        </div>
        
        <div className="bg-purple-500 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Collection Rate</p>
              <p className="text-2xl font-bold">{financialSummary.collectionRate}%</p>
            </div>
            <Image src="/percentage.png" alt="Rate" width={40} height={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {financialSummary.monthlyRevenue.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-blue-500 w-full rounded-t"
                  style={{ 
                    height: `${(item.amount / Math.max(...financialSummary.monthlyRevenue.map(r => r.amount))) * 200}px`,
                    minHeight: '20px'
                  }}
                ></div>
                <span className="text-xs mt-2">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Revenue Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Department-wise Revenue</h3>
          <div className="space-y-3">
            {financialSummary.departmentWiseRevenue.map((dept, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full bg-${['blue', 'green', 'purple', 'orange', 'red'][index % 5]}-500`}></div>
                  <span className="font-medium">{dept.department}</span>
                  <span className="text-sm text-gray-500">({dept.students} students)</span>
                </div>
                <span className="font-semibold">₹{(dept.revenue / 100000).toFixed(1)}L</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <button className="text-blue-600 text-sm hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Student</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {currentFeeRecords.slice(0, 5).map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{record.studentName}</td>
                  <td className="p-2">₹{record.paidAmount.toLocaleString()}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      record.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-2">{record.paymentDate || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderFeeManagement = () => (
    <div className="space-y-6">
      {/* Fee Management Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Fee Management</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowFeeStructureModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Fee Structure
          </button>
          <button 
            onClick={() => alert("Fee collection interface would open here")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Collect Fee
          </button>
        </div>
      </div>

      {/* Fee Collection Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-medium text-gray-600">Total Collected</h3>
          <p className="text-2xl font-bold text-green-600">
            ₹{currentFeeRecords.reduce((sum, record) => sum + record.paidAmount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-medium text-gray-600">Pending Collection</h3>
          <p className="text-2xl font-bold text-red-600">
            ₹{currentFeeRecords.reduce((sum, record) => sum + record.pendingAmount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-medium text-gray-600">Collection Rate</h3>
          <p className="text-2xl font-bold text-blue-600">{financialSummary.collectionRate}%</p>
        </div>
      </div>

      {/* Student Fee Records Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Student Fee Records</h3>
            <div className="flex space-x-2">
              <select 
                value={feeFilters.department}
                onChange={(e) => setFeeFilters(prev => ({...prev, department: e.target.value}))}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
              </select>
              <select 
                value={feeFilters.status}
                onChange={(e) => setFeeFilters(prev => ({...prev, status: e.target.value}))}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Student Details</th>
                <th className="text-left p-3">Department</th>
                <th className="text-left p-3">Total Amount</th>
                <th className="text-left p-3">Paid Amount</th>
                <th className="text-left p-3">Pending</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Due Date</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentFeeRecords.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div>
                      <div className="font-medium">{record.studentName}</div>
                      <div className="text-xs text-gray-500">{record.studentEnrollment}</div>
                    </div>
                  </td>
                  <td className="p-3">{record.department}</td>
                  <td className="p-3">₹{record.totalAmount.toLocaleString()}</td>
                  <td className="p-3 text-green-600 font-medium">₹{record.paidAmount.toLocaleString()}</td>
                  <td className="p-3 text-red-600 font-medium">₹{record.pendingAmount.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      record.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-3">{record.dueDate}</td>
                  <td className="p-3">
                    <div className="flex space-x-1">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Image src="/view.png" alt="View" width={16} height={16} />
                      </button>
                      <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <Image src="/edit.png" alt="Edit" width={16} height={16} />
                      </button>
                      {record.status === 'Paid' && (
                        <button className="p-1 text-purple-600 hover:bg-purple-50 rounded">
                          <Image src="/print.png" alt="Print" width={16} height={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderExpenses = () => (
    <div className="space-y-6">
      {/* Expense Management Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Expense Management</h2>
        <button 
          onClick={() => setShowExpenseModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Add Expense
        </button>
      </div>

      {/* Expense Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-medium text-gray-600">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">₹{(financialSummary.totalExpenses / 100000).toFixed(1)}L</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-medium text-gray-600">This Month</h3>
          <p className="text-2xl font-bold text-orange-600">₹{(1000000 / 100000).toFixed(1)}L</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-medium text-gray-600">Pending Payments</h3>
          <p className="text-2xl font-bold text-yellow-600">₹{(350000 / 100000).toFixed(1)}L</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-medium text-gray-600">Approved Today</h3>
          <p className="text-2xl font-bold text-blue-600">₹{(125000 / 100000).toFixed(1)}L</p>
        </div>
      </div>

      {/* Recent Expenses Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recent Expenses</h3>
            <div className="flex space-x-2">
              <select 
                value={expenseFilters.category}
                onChange={(e) => setExpenseFilters(prev => ({...prev, category: e.target.value}))}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="">All Categories</option>
                {expenseCategories.map(cat => (
                  <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                ))}
              </select>
              <select 
                value={expenseFilters.status}
                onChange={(e) => setExpenseFilters(prev => ({...prev, status: e.target.value}))}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Description</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Vendor</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentExpenseRecords.map((expense) => {
                const category = expenseCategories.find(cat => cat.id === expense.categoryId)
                return (
                  <tr key={expense.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-xs text-gray-500">{expense.invoiceNumber}</div>
                    </td>
                    <td className="p-3">{category?.name}</td>
                    <td className="p-3 font-medium">₹{expense.amount.toLocaleString()}</td>
                    <td className="p-3">{expense.vendor}</td>
                    <td className="p-3">{expense.date}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        expense.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-1">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Image src="/view.png" alt="View" width={16} height={16} />
                        </button>
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Image src="/edit.png" alt="Edit" width={16} height={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderBudget = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Budget Planning</h2>
        <button 
          onClick={() => setShowBudgetModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Create Budget
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Annual Budget Overview</h3>
        <div className="text-center text-gray-500">
          Budget planning interface will be implemented here with:
          <ul className="mt-2 text-left max-w-md mx-auto">
            <li>• Budget allocation by category</li>
            <li>• Variance analysis</li>
            <li>• Forecasting tools</li>
            <li>• Budget vs actual comparisons</li>
          </ul>
        </div>
      </div>
    </div>
  )

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Financial Reports</h2>
        <button 
          onClick={() => setShowReportModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Generate Report
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Fee Collection Report", desc: "Detailed fee collection analysis", icon: "/report.png" },
          { title: "Expense Report", desc: "Monthly/Annual expense breakdown", icon: "/expense.png" },
          { title: "Profit & Loss", desc: "Financial performance summary", icon: "/chart.png" },
          { title: "Outstanding Fees", desc: "Pending fee collections", icon: "/pending.png" },
          { title: "Department Wise", desc: "Revenue by departments", icon: "/department.png" },
          { title: "Cash Flow", desc: "Cash inflow and outflow", icon: "/cash.png" },
        ].map((report, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start space-x-3">
              <Image src={report.icon} alt={report.title} width={24} height={24} />
              <div>
                <h3 className="font-semibold">{report.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{report.desc}</p>
                  <button 
                    onClick={() => handleGenerateReport(["fee-collection", "expense-report", "profit-loss", "outstanding-fees", "department-wise", "cash-flow"][index])}
                    className="mt-3 text-blue-600 text-sm hover:underline"
                  >
                    Generate →
                  </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch(activeTab) {
      case "overview": return renderOverview()
      case "fees": return renderFeeManagement()
      case "expenses": return renderExpenses()
      case "budget": return renderBudget()
      case "reports": return renderReports()
      default: return renderOverview()
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Finance Management</h1>
            <p className="text-gray-600 mt-1">Manage college finances, fees, and expenses</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="2024-25">Academic Year 2024-25</option>
              <option value="2023-24">Academic Year 2023-24</option>
              <option value="2022-23">Academic Year 2022-23</option>
            </select>
            <button 
              onClick={handleExportData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b bg-gray-50">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Image src={tab.icon} alt={tab.label} width={20} height={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>

      {/* Fee Structure Modal */}
      {showFeeStructureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Fee Structure</h3>
              <button 
                onClick={() => setShowFeeStructureModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddFeeStructure} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select 
                  value={feeStructureForm.departmentCode}
                  onChange={(e) => setFeeStructureForm(prev => ({...prev, departmentCode: e.target.value}))}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science & Engineering</option>
                  <option value="ECE">Electronics & Communication</option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="CE">Civil Engineering</option>
                  <option value="EE">Electrical Engineering</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Semester</label>
                <select 
                  value={feeStructureForm.semester}
                  onChange={(e) => setFeeStructureForm(prev => ({...prev, semester: parseInt(e.target.value)}))}
                  className="w-full border rounded px-3 py-2"
                >
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Academic Year</label>
                <select 
                  value={feeStructureForm.academicYear}
                  onChange={(e) => setFeeStructureForm(prev => ({...prev, academicYear: e.target.value}))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="2024-25">2024-25</option>
                  <option value="2025-26">2025-26</option>
                  <option value="2026-27">2026-27</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  value={feeCategory}
                  onChange={(e) => setFeeCategory(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="general">General</option>
                  <option value="sc">SC</option>
                  <option value="st">ST</option>
                  <option value="obc">OBC</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Fee Categories</label>
                {feeCategories.filter(cat => cat.isActive).map(category => (
                  <div key={category.id} className="flex items-center justify-between border rounded p-2">
                    <span className="text-sm">{category.name}</span>
                    <input 
                      type="number"
                      placeholder="Amount"
                      className="border rounded px-2 py-1 w-24 text-sm"
                      onChange={(e) => {
                        const amount = parseFloat(e.target.value) || 0
                        setFeeStructureForm(prev => ({
                          ...prev,
                          fees: [
                            ...prev.fees.filter(f => f.categoryId !== category.id),
                            { categoryId: category.id, amount }
                          ]
                        }))
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input id="publishNow" type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} />
                <label htmlFor="publishNow" className="text-sm">Publish now</label>
              </div>
              <div className="flex space-x-2 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowFeeStructureModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : 'Add Structure'}
                </button>
              </div>
              {submitMsg && <div className="text-xs text-gray-500">{submitMsg}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Expense</h3>
              <button 
                onClick={() => setShowExpenseModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input 
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm(prev => ({...prev, description: e.target.value}))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter expense description"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  value={expenseForm.categoryId}
                  onChange={(e) => setExpenseForm(prev => ({...prev, categoryId: e.target.value}))}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select Category</option>
                  {expenseCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                <input 
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm(prev => ({...prev, amount: e.target.value}))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input 
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm(prev => ({...prev, date: e.target.value}))}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select 
                  value={expenseForm.paymentMethod}
                  onChange={(e) => setExpenseForm(prev => ({...prev, paymentMethod: e.target.value}))}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Online">Online</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vendor</label>
                <input 
                  type="text"
                  value={expenseForm.vendor}
                  onChange={(e) => setExpenseForm(prev => ({...prev, vendor: e.target.value}))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter vendor name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Invoice Number</label>
                <input 
                  type="text"
                  value={expenseForm.invoiceNumber}
                  onChange={(e) => setExpenseForm(prev => ({...prev, invoiceNumber: e.target.value}))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter invoice number"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Budget Plan</h3>
              <button 
                onClick={() => setShowBudgetModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">Budget planning interface for allocating funds across different categories:</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-3">
                  <h4 className="font-medium">Faculty Salaries</h4>
                  <input type="number" placeholder="Allocated Amount" className="w-full border rounded px-2 py-1 mt-1 text-sm" />
                </div>
                <div className="border rounded p-3">
                  <h4 className="font-medium">Infrastructure</h4>
                  <input type="number" placeholder="Allocated Amount" className="w-full border rounded px-2 py-1 mt-1 text-sm" />
                </div>
                <div className="border rounded p-3">
                  <h4 className="font-medium">Equipment</h4>
                  <input type="number" placeholder="Allocated Amount" className="w-full border rounded px-2 py-1 mt-1 text-sm" />
                </div>
                <div className="border rounded p-3">
                  <h4 className="font-medium">Utilities</h4>
                  <input type="number" placeholder="Allocated Amount" className="w-full border rounded px-2 py-1 mt-1 text-sm" />
                </div>
              </div>
              <div className="flex space-x-2 pt-4">
                <button 
                  onClick={() => setShowBudgetModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateBudget}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Create Budget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generate Report</h3>
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-gray-600 mb-4">Select the type of report you want to generate:</p>
              {[
                { id: "fee-collection", name: "Fee Collection Report" },
                { id: "expense-report", name: "Expense Report" },
                { id: "profit-loss", name: "Profit & Loss Statement" },
                { id: "outstanding-fees", name: "Outstanding Fees Report" },
                { id: "department-wise", name: "Department-wise Revenue" },
                { id: "cash-flow", name: "Cash Flow Report" }
              ].map(report => (
                <button
                  key={report.id}
                  onClick={() => handleGenerateReport(report.id)}
                  className="w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors"
                >
                  {report.name}
                </button>
              ))}
            </div>
            <div className="pt-4">
              <button 
                onClick={() => setShowReportModal(false)}
                className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FinancePage