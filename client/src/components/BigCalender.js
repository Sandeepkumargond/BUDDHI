"use client";

import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";

const localizer = momentLocalizer(moment);

const BigCalendar = () => {
  const { user } = useAuth();
  // store current view as a string (e.g. Views.WORK_WEEK)
  const [view, setView] = useState(Views.WORK_WEEK);
  const [events, setEvents] = useState([]);

  // Helper: convert timetable slots to calendar events in the current week
  const slotsToEvents = (slots) => {
    const startOfWeek = moment().startOf('week'); // Sunday as 0 by default
    return (slots || []).map((s) => {
      const day = Number(s.dayOfWeek ?? 0);
      const startMins = Number(s.startMins ?? 0);
      const endMins = Number(s.endMins ?? 0);
      const start = startOfWeek.clone().add(day, 'days').hour(Math.floor(startMins/60)).minute(startMins%60).second(0);
      const end = startOfWeek.clone().add(day, 'days').hour(Math.floor(endMins/60)).minute(endMins%60).second(0);
      return {
        title: s.course?.name || s.course?.title || s.room || 'Class',
        allDay: false,
        start: start.toDate(),
        end: end.toDate(),
      };
    });
  };

  // Fetch schedule and build events dynamically
  useEffect(() => {
    let cancelled = false;
    const fetchSchedule = async () => {
      const isStudent = !!(user && (user.role === 'student' || typeof user?.semester === 'number'));
      const isFaculty = !!(user && (user.role === 'faculty' || Array.isArray(user?.assignedCourses)));

      // Query the matching role first to avoid 401 spam from the API logger
      if (isStudent) {
        try {
          const resStudent = await apiService.request(`/schedule/student`, { silent: true });
          const studentSlots = resStudent?.data?.slots || [];
          if (!cancelled && Array.isArray(studentSlots)) {
            setEvents(slotsToEvents(studentSlots));
            return;
          }
        } catch {}
      } else if (isFaculty && user?._id) {
        try {
          const resFaculty = await apiService.request(`/schedule/faculty/${user._id}`);
          const facultySlots = resFaculty?.data?.slots || [];
          if (!cancelled && Array.isArray(facultySlots)) {
            setEvents(slotsToEvents(facultySlots));
            return;
          }
        } catch {}
      } else {
        // Unknown role: try student then faculty quietly
        try {
          const resStudent = await apiService.request(`/schedule/student`, { silent: true });
          const studentSlots = resStudent?.data?.slots || [];
          if (!cancelled && Array.isArray(studentSlots) && studentSlots.length > 0) {
            setEvents(slotsToEvents(studentSlots));
            return;
          }
        } catch {}
        try {
          if (user?._id) {
            const resFaculty = await apiService.request(`/schedule/faculty/${user._id}`, { silent: true });
            const facultySlots = resFaculty?.data?.slots || [];
            if (!cancelled && Array.isArray(facultySlots) && facultySlots.length > 0) {
              setEvents(slotsToEvents(facultySlots));
              return;
            }
          }
        } catch {}
      }
      if (!cancelled) setEvents([]);
    };
    fetchSchedule();
    return () => { cancelled = true; };
  }, [user]);

  const handleOnChangeView = (selectedView) => {
    setView(selectedView);
  };

  // Dynamic min/max bound to today's date at 8:00–17:00
  const today = new Date();
  const min = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0, 0);
  const max = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0, 0);

  // Keep events neatly inside cells
  const eventPropGetter = useCallback(() => ({
    style: {
      padding: '2px 4px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      borderRadius: 4,
      lineHeight: 1.2,
      margin: 0,
    }
  }), []);

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      views={["day","work_week"]}
      view={view}
      style={{ height: 650 }}
      onView={handleOnChangeView}
      min={min}
      max={max}
      eventPropGetter={eventPropGetter}
      components={{
        header: () => (<span />),
        timeGutterHeader: () => (<span />)
      }}
    />
  );
};

export default BigCalendar;
