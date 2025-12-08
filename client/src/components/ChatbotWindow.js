"use client";
import { useEffect, useRef, useState } from "react";
import { useChatbot } from "../context/ChatbotContext";
import { useAuth } from "../context/AuthContext";

export default function ChatbotWindow() {
  const { isOpen, close, messages, sendMessage } = useChatbot();
  const { user, role } = useAuth();
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        bottom: 84,
        width: 380,
        maxWidth: "calc(100vw - 40px)",
        height: 520,
        maxHeight: "calc(100vh - 140px)",
        borderRadius: 16,
        background: "#ffffff",
        border: "1px solid #e6e6e6",
        boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
        overflow: "hidden",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "#f8fafc", // slate-50
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "#0ea5e9", // sky-600
            color: "white",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            letterSpacing: 0.2,
          }}>BA</div>
          <div>
            <div style={{ fontWeight: 600, color: "#0f172a" }}>Buddhi Assistant</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Ask about courses, attendance, fees, exams</div>
          </div>
        </div>
        <button
          onClick={close}
          aria-label="Close"
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#6b7280",
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: 12, background: "#fcfdff" }}>
        {messages.length === 0 ? (
          <div style={{ color: "#6b7280", fontSize: 14 }}>
            Welcome! Describe your issue or question.
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 10,
            }}>
              <div style={{
                maxWidth: "80%",
                padding: "10px 12px",
                borderRadius: 12,
                background: m.role === "user" ? "#0ea5e9" : "#ffffff",
                color: m.role === "user" ? "white" : "#0f172a",
                border: m.role === "user" ? "none" : "1px solid #e5e7eb",
                boxShadow: m.role === "user" ? "0 2px 6px rgba(2, 6, 23, 0.06)" : "0 2px 6px rgba(2, 6, 23, 0.06)",
                whiteSpace: "pre-wrap",
              }}>
                {m.text}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const text = input.trim();
          if (!text) return;
          setInput("");
          sendMessage(text, { user, role });
        }}
        style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #e5e7eb", background: "white" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about attendance, grades, fees, or exams..."
          style={{
            flex: 1,
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            padding: "10px 12px",
            outline: "none",
            fontSize: 14,
            color: "#0f172a",
            background: "#ffffff",
          }}
        />
        <button
          type="submit"
          style={{
            borderRadius: 8,
            background: "#0ea5e9",
            color: "white",
            border: "none",
            padding: "10px 14px",
            cursor: "pointer",
          }}
        >
          ➤
        </button>
      </form>
    </div>
  );
}
