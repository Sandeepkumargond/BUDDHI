"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

/**
 * Donut Chart for displaying BUDDHI student status distribution
 * Shows At-risk (red), On the Verge (yellow), Normal (green)
 */
const BuddhiDonutChart = ({ atRisk = 0, onTheVerge = 0, normal = 0 }) => {
  const total = atRisk + onTheVerge + normal;

  // Calculate percentages
  const atRiskPercentage = total > 0 ? Math.round((atRisk / total) * 100) : 0;
  const onTheVergePercentage = total > 0 ? Math.round((onTheVerge / total) * 100) : 0;
  const normalPercentage = total > 0 ? Math.round((normal / total) * 100) : 0;

  const chartData = [
    { name: "At-Risk", value: atRisk, percentage: atRiskPercentage, color: "#EF4444" }, // red-500
    { name: "On the Verge", value: onTheVerge, percentage: onTheVergePercentage, color: "#F59E0B" }, // amber-500
    { name: "Normal", value: normal, percentage: normalPercentage, color: "#10B981" }, // green-500
  ];

  // Custom label renderer
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label if slice too small

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="14"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius="80%"
            innerRadius="50%"
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend below chart */}
      <div className="flex justify-center gap-6 mt-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <div className="text-xs">
              <div className="font-medium text-gray-700">{item.name}</div>
              <div className="text-gray-500">
                {item.value} ({item.percentage}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuddhiDonutChart;
