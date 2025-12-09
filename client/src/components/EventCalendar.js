"use client";

import { useMemo, useState, useEffect } from "react";
import { FaVideo, FaCalendarPlus } from "react-icons/fa";

// Renders a responsive Google Calendar embed and quick links to create events/Meet
const EventCalendar = () => {
  const embedSrc = useMemo(() => {
    // Use env var if present, else default public calendar embed URL placeholder
    const cfg = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL;
    return cfg || "https://calendar.google.com/calendar/embed?src=your_calendar_id%40group.calendar.google.com&ctz=Asia%2FKolkata";
  }, []);

  // Derive target calendarId and timezone from the embed URL so events are created on the same calendar
  const derived = useMemo(() => {
    try {
      const u = new URL(embedSrc);
      const srcParams = u.searchParams.getAll('src');
      const calendarId = srcParams && srcParams.length > 0 ? srcParams[0] : undefined;
      const ctz = u.searchParams.get('ctz') || 'Asia/Kolkata';
      return { calendarId, ctz };
    } catch {
      return { calendarId: undefined, ctz: 'Asia/Kolkata' };
    }
  }, [embedSrc]);

  const [status, setStatus] = useState("idle"); // idle | opened | saved
  const [reloadKey, setReloadKey] = useState(0);
  const [lastOpenedAt, setLastOpenedAt] = useState(null);

  // Opens Google Calendar event creation page with prefilled details; user can add Meet inside Google UI
  const openEventEditor = () => {
    try {
      const srcQ = derived.calendarId ? `&src=${encodeURIComponent(derived.calendarId)}` : '';
      const tzQ = derived.ctz ? `&ctz=${encodeURIComponent(derived.ctz)}` : '';
      const url = `https://calendar.google.com/calendar/u/0/r/eventedit?${srcQ ? srcQ.slice(1) : ''}${tzQ}`;
      window.open(url, "_blank", "noopener,noreferrer");
      setStatus("opened");
      setLastOpenedAt(Date.now());
    } catch (e) {}
  };

  const openMeetEditor = () => {
    try {
      const srcQ = derived.calendarId ? `&src=${encodeURIComponent(derived.calendarId)}` : '';
      const tzQ = derived.ctz ? `&ctz=${encodeURIComponent(derived.ctz)}` : '';
      const url = `https://calendar.google.com/calendar/u/0/r/eventedit?${srcQ ? srcQ.slice(1) : ''}${tzQ}`;
      window.open(url, "_blank", "noopener,noreferrer");
      setStatus("opened");
      setLastOpenedAt(Date.now());
    } catch (e) {}
  };

  const markSavedAndRefresh = () => {
    setStatus("saved");
    // Force reload of the iframe to reflect newly created events
    setReloadKey((k) => k + 1);
  };

  // Auto-refresh calendar when returning focus after opening editor
  // Heuristic: when window regains focus and an editor was opened recently, refresh once.
  useEffect(() => {
    const onFocus = () => {
      if (lastOpenedAt && Date.now() - lastOpenedAt < 5 * 60 * 1000) {
        setReloadKey((k) => k + 1);
        setStatus("saved");
        setLastOpenedAt(null);
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [lastOpenedAt]);

  // Safety net: periodic light refresh every 60s to reflect changes
  useEffect(() => {
    const id = setInterval(() => setReloadKey((k)=>k+1), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Google Calendar</h1>
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={openEventEditor}
            className="px-3 py-2 rounded-md text-white flex items-center gap-2"
            style={{ background: "#2563eb" }}
            title="Open Google Calendar to create an event"
          >
            <FaCalendarPlus /> Schedule Event
          </button>
          <button
            type="button"
            onClick={openMeetEditor}
            className="px-3 py-2 rounded-md text-white flex items-center gap-2"
            style={{ background: "#10b981" }}
            title="Open Google Calendar to schedule a meeting"
          >
            <FaVideo /> Schedule Meet
          </button>
        </div>
      </div>
      {/* No inputs; two buttons only. Auto-refresh on focus/interval will reflect new events. */}

      {/* Removed inputs per requirement. */}

      <div className="rounded-md overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
        <div className="relative" style={{ paddingBottom: "75%", height: 0 }}>
          <iframe
            title="Google Calendar"
            key={reloadKey}
            src={embedSrc}
            style={{ border: 0, position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            frameBorder="0"
            scrolling="no"
          />
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
