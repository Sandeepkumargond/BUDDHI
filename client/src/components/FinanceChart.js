"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { apiService } from "@/lib/api";

const FinanceChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchFinanceData();
  }, [year]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const response = await apiService.request(`/admin/analytics/finance?year=${year}`, {
        method: "GET"
      });
      setData(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch finance data:", error);
      // Fallback to empty data
      setData([
        { name: "Jan", income: 0, expense: 0 },
        { name: "Feb", income: 0, expense: 0 },
        { name: "Mar", income: 0, expense: 0 },
        { name: "Apr", income: 0, expense: 0 },
        { name: "May", income: 0, expense: 0 },
        { name: "Jun", income: 0, expense: 0 },
        { name: "Jul", income: 0, expense: 0 },
        { name: "Aug", income: 0, expense: 0 },
        { name: "Sep", income: 0, expense: 0 },
        { name: "Oct", income: 0, expense: 0 },
        { name: "Nov", income: 0, expense: 0 },
        { name: "Dec", income: 0, expense: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-semibold">Finance</h1>
        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-2 py-1 border rounded-md text-sm"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Image src="/moreDark.png" alt="" width={20} height={20} />
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="90%">\n          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tick={{ fill: "#d1d5db" }}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false}  tickMargin={20}/>
            <Tooltip 
              formatter={(value) => `₹${value.toLocaleString()}`}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            />
            <Legend
              align="center"
              verticalAlign="top"
              wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#C3EBFA"
              strokeWidth={5}
              name="Income"
            />
            <Line 
              type="monotone" 
              dataKey="expense" 
              stroke="#CFCEFF" 
              strokeWidth={5}
              name="Expense"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default FinanceChart;
