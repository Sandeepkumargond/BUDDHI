"use client";
import Image from "next/image";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const CountChart = () => {
  const { 
    stats, 
    loading, 
    error, 
    refetch, 
    lastUpdated,
    maleStudentCount,
    femaleStudentCount,
    totalStudentCount 
  } = useDashboardStats();

  // Calculate percentages
  const totalCount = maleStudentCount + femaleStudentCount;
  const boysPercentage = totalCount > 0 ? Math.round((maleStudentCount / totalCount) * 100) : 0;
  const girlsPercentage = totalCount > 0 ? Math.round((femaleStudentCount / totalCount) * 100) : 0;

  // Prepare chart data
  const chartData = [
    {
      name: "Total",
      count: totalCount,
      fill: "white",
    },
    {
      name: "Girls",
      count: femaleStudentCount,
      fill: "#FAE27C",
    },
    {
      name: "Boys",
      count: maleStudentCount,
      fill: "#C3EBFA",
    },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl w-full h-full p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl w-full h-full p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">
            ⚠️
          </div>
          <p className="text-red-500 text-sm mb-2">{error}</p>
          <button 
            onClick={refetch}
            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* TITLE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Students</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={refetch} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh data"
          >
            🔄
          </button>
          <Image src="/moreDark.png" alt="" width={20} height={20} />
        </div>
      </div>
      
      {/* CHART */}
      <div className="relative w-full h-64 min-h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="100%"
            barSize={32}
            data={chartData}
          >
            <RadialBar background dataKey="count" />
          </RadialBarChart>
        </ResponsiveContainer>
        <Image
          src="/maleFemale.png"
          alt=""
          width={50}
          height={50}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
      
      {/* BOTTOM */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-[#C3EBFA] rounded-full" />
          <h1 className="font-bold">{maleStudentCount.toLocaleString()}</h1>
          <h2 className="text-xs text-gray-300">Boys ({boysPercentage}%)</h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-[#FAE27C] rounded-full" />
          <h1 className="font-bold">{femaleStudentCount.toLocaleString()}</h1>
          <h2 className="text-xs text-gray-300">Girls ({girlsPercentage}%)</h2>
        </div>
      </div>
      
      {/* LAST UPDATED INFO */}
      <div className="text-center mt-2">
        <p className="text-xs text-gray-400">
          Total: {totalCount.toLocaleString()} students • Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}
        </p>
      </div>
    </div>
  );
};

export default CountChart;
