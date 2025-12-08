import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import { ChatbotProvider } from "../context/ChatbotContext";
import ChatbotButton from "../components/ChatbotButton";
import ChatbotWindow from "../components/ChatbotWindow";

export const metadata = {
  title: "BUDDHI - Education Management System",
  description: "Complete education management platform",
};

export default function RootLayout({ children }) {
  // Optionally detect role from auth context or route; default to guest.
  const initialRole = "guest";
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ChatbotProvider initialRole={initialRole}>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
            <ChatbotButton />
            <ChatbotWindow />
          </AuthProvider>
        </ChatbotProvider>
      </body>
    </html>
  );
}
