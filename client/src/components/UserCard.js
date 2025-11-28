"use client";

import Image from "next/image";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const UserCard = ({ type }) => {
  const { stats, loading, error } = useDashboardStats();
  
  // Calculate count based on type
  let count = 0;
  if (stats) {
    if (type === "student") {
      count = stats.student || 0;
    } else if (type === "faculty") {
      count = stats.faculty || 0;
    } else if (type === "staff") {
      count = stats.staff || 0;
    } else if (type === "admin") {
      count = stats.admin || 0;
    } else {
      // For empty type, show total
      count = (stats.student || 0) + (stats.faculty || 0) + (stats.staff || 0);
    }
  }

  const displayCount = loading ? "..." : error ? "Error" : count.toLocaleString();
  const displayType = type || "total";

  return (
    <div
      className="rounded-2xl p-4 flex-1 min-w-[130px]
      odd:bg-[#CFCEFF] even:bg-[#FAE27C]"
    >
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
          2024/25
        </span>
        <Image src="/more.png" alt="" width={20} height={20} />
      </div>

      <h1 className="text-2xl font-semibold my-4" title={error || ""}>
        {displayCount}
      </h1>
      <h2 className="capitalize text-sm font-medium text-gray-500">
        {displayType}s
      </h2>
    </div>
  );
};

export default UserCard;
