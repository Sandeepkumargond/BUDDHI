"use client"

import { useState } from "react";
import Image from "next/image";

const TableSearch = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    
    // Call the onSearch function if provided
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
      <Image src="/search.png" alt="" width={14} height={14} />
      <input
        type="text"
        placeholder="Search..."
        value={searchValue}
        onChange={handleInputChange}
        className="w-[200px] p-2 bg-transparent outline-none"
      />
    </div>
  );
};

export default TableSearch;
