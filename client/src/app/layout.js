import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import "./globals.css";

export const metadata = {
  title: "BUDDHI - Education Management System",
  description: "Complete education management platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
