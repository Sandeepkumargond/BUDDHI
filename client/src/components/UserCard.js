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
      className="rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 flex-1 min-w-[120px] sm:min-w-[130px]
      odd:bg-[#CFCEFF] even:bg-[#FAE27C] transition-all hover:shadow-md"
    >
      <div className="flex justify-between items-center">
        <span className="text-[9px] sm:text-[10px] bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-green-600 font-medium">
          2024/25
        </span>
        <Image src="/more.png" alt="" width={16} height={16} className="sm:w-5 sm:h-5 opacity-60" />
      </div>

      <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold my-2 sm:my-3 lg:my-4 truncate" title={error || ""}>
        {displayCount}
      </h1>
      <h2 className="capitalize text-xs sm:text-sm font-medium text-gray-600">
        {displayType}s
      </h2>
    </div>
  );
};

export default UserCard;
