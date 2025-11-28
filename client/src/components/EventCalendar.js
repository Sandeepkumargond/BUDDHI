"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const EventCalendar = () => {
  const [value, onChange] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white p-4 rounded-md">
      <h1 className="text-xl font-semibold mb-4">Calendar</h1>
      {mounted && <Calendar onChange={onChange} value={value} />}
    </div>
  );
};

export default EventCalendar;
