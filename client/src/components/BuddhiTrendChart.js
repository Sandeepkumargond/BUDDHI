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
  /* 
   * Note: Modified to rely on passed 'data' prop to avoid hardcoded values.
   * If history is unavailable, it will render empty or the single data point passed.
   */
  const chartData = data;

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
