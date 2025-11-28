"use client";

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

/**
 * Trend Chart for displaying semester-wise student status trends
 * Shows 3 lines: At-risk (red), On the Verge (orange), Normal (green)
 */
const BuddhiTrendChart = ({ data = [] }) => {
  // Default data if none provided
  const defaultData = [
    { month: "Jul", atRisk: 1200, onTheVerge: 1400, normal: 2800 },
    { month: "Aug", atRisk: 1100, onTheVerge: 1500, normal: 3000 },
    { month: "Sep", atRisk: 1000, onTheVerge: 1600, normal: 3200 },
    { month: "Oct", atRisk: 950, onTheVerge: 1650, normal: 3300 },
    { month: "Nov", atRisk: 900, onTheVerge: 1700, normal: 3400 },
    { month: "Dec", atRisk: 850, onTheVerge: 1750, normal: 3500 },
    { month: "Jan", atRisk: 800, onTheVerge: 1800, normal: 3600 },
    { month: "Feb", atRisk: 750, onTheVerge: 1850, normal: 3650 },
    { month: "Mar", atRisk: 700, onTheVerge: 1900, normal: 3700 },
    { month: "Apr", atRisk: 650, onTheVerge: 1950, normal: 3750 },
    { month: "May", atRisk: 600, onTheVerge: 2000, normal: 3800 },
    { month: "Jun", atRisk: 550, onTheVerge: 2050, normal: 3850 },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: "12px" }}
          />
          <Line
            type="monotone"
            dataKey="atRisk"
            stroke="#EF4444"
            strokeWidth={2}
            dot={{ fill: "#EF4444", r: 4 }}
            name="At-Risk"
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="onTheVerge"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={{ fill: "#F59E0B", r: 4 }}
            name="On the Verge"
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="normal"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: "#10B981", r: 4 }}
            name="Normal"
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BuddhiTrendChart;
