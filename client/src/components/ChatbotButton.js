"use client";
import { useChatbot } from "../context/ChatbotContext";

export default function ChatbotButton() {
  const { toggle } = useChatbot();
  const btnStyle = {
    position: "fixed",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    border: "1px solid #e5e7eb",
    background: "#0ea5e9", // professional primary (sky-600)
    color: "white",
    boxShadow: "0 8px 24px rgba(2, 6, 23, 0.18)",
    cursor: "pointer",
    zIndex: 1000,
    display: "grid",
    placeItems: "center",
    transition: "transform 160ms ease, box-shadow 160ms ease, background 160ms ease",
  };
  const iconStyle = {
    width: 28,
    height: 28,
    display: "block",
  };
  return (
    <button
      onClick={toggle}
      aria-label="Open chatbot"
      style={btnStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 12px 28px rgba(2, 6, 23, 0.22)";
        e.currentTarget.style.background = "#0284c7"; // sky-700 on hover
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(2, 6, 23, 0.18)";
        e.currentTarget.style.background = "#0ea5e9";
      }}
    >
      {/* Professional chat icon */}
      <svg viewBox="0 0 24 24" style={iconStyle} aria-hidden="true">
        <path
          d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H11l-3.2 2.4V16H7.5A2.5 2.5 0 0 1 5 13.5v-7z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9 9.8h6" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M9 12h5" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </button>
  );
}
