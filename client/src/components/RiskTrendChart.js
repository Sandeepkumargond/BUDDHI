"use client";

import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";

const RiskTrendChart = ({ data, loading }) => {
    if (loading) {
        return <div className="h-full flex items-center justify-center">Loading Analytics...</div>;
    }

    if (!data || data.length === 0) {
        return <div className="h-full flex items-center justify-center">No risk data available.</div>;
    }

    // Aggregate Data: Count students in each risk category
    const riskCounts = {
        "No Risk": 0,
        "Moderate": 0,
        "Critical": 0,
        "On Verge": 0
    };

    data.forEach(item => {
        switch (item.risk_level) {
            case "no_risk": riskCounts["No Risk"]++; break;
            case "moderate_risk": riskCounts["Moderate"]++; break;
            case "critical": riskCounts["Critical"]++; break;
            case "on_the_verge_of_drop": riskCounts["On Verge"]++; break;
            default: break;
        }
    });

    const chartData = Object.keys(riskCounts).map(key => ({
        name: key,
        students: riskCounts[key],
    }));

    const COLORS = {
        "No Risk": "#4CAF50", // Green
        "Moderate": "#FF9800", // Orange
        "Critical": "#F44336", // Red
        "On Verge": "#9C27B0"  // Purple
    };

    return (
        <div className="bg-white rounded-lg p-4 h-full shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Student Risk Distribution</h2>
                {/* <span className="text-sm text-gray-500">Real-time ML Analysis</span> */}
            </div>
            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tick={{ fill: "#6b7280" }}
                            tickLine={false}
                        />
                        <YAxis axisLine={false} tick={{ fill: "#6b7280" }} tickLine={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }}
                            cursor={{ fill: "transparent" }}
                        />
                        <Legend align="left" verticalAlign="top" wrapperStyle={{ paddingTop: "20px", paddingBottom: "40px" }} />
                        <Bar
                            dataKey="students"
                            fill="#8884d8"
                            radius={[10, 10, 0, 0]}
                            barSize={50}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RiskTrendChart;
