"use client";
import { useChatbot } from "../context/ChatbotContext";

export default function ChatbotButton() {
  const { toggle } = useChatbot();
  const btnStyle = {
    position: "fixed",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    border: "none",
    background: "linear-gradient(135deg, #21c18f, #14b8a6)",
    color: "white",
    boxShadow: "0 12px 32px rgba(0,0,0,0.22)",
    cursor: "pointer",
    zIndex: 1000,
    display: "grid",
    placeItems: "center",
    transition: "transform 150ms ease, box-shadow 150ms ease",
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
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 16px 36px rgba(0,0,0,0.24)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.22)";
      }}
    >
      {/* Clean, modern chat icon (outline, squared viewBox) */}
      <svg viewBox="0 0 24 24" style={iconStyle} aria-hidden="true">
        <path
          d="M4.75 5.5c0-1.243 1.007-2.25 2.25-2.25h10c1.243 0 2.25 1.007 2.25 2.25v8c0 1.243-1.007 2.25-2.25 2.25H10.5l-3.5 2.625V15.75H7c-1.243 0-2.25-1.007-2.25-2.25v-8z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="9.8" r="1.25" fill="#ffffff" />
        <circle cx="12" cy="9.8" r="1.25" fill="#ffffff" />
        <circle cx="15" cy="9.8" r="1.25" fill="#ffffff" />
      </svg>
    </button>
  );
}
