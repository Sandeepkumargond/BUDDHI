"use client";
import { createContext, useContext, useState, useCallback } from "react";

const ChatbotContext = createContext(null);

export function ChatbotProvider({ children, initialRole = "guest" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [role, setRole] = useState(initialRole);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const sendMessage = useCallback(async (text, context = {}) => {
    const { user, role: userRole } = context;
    const activeRole = userRole || role;

    const userMsg = { id: Date.now(), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    try {
      const res = await fetch(`/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pass user context and role to the API
        body: JSON.stringify({
          prompt: text,
          role: activeRole,
          userContext: user || {}
        }),
      });
      const data = await res.json();
      const botMsg = { id: Date.now() + 1, role: "assistant", text: data.reply ?? "" };
      setMessages((m) => [...m, botMsg]);
    } catch (e) {
      setMessages((m) => [...m, { id: Date.now() + 2, role: "assistant", text: "Sorry, something went wrong." }]);
    }
  }, [role]);

  return (
    <ChatbotContext.Provider value={{ isOpen, open, close, toggle, sendMessage, messages, role, setRole }}>
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const ctx = useContext(ChatbotContext);
  if (!ctx) throw new Error("useChatbot must be used within ChatbotProvider");
  return ctx;
}
