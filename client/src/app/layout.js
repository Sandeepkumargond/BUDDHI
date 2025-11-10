import "./globals.css";

export const metadata = {
  title: "Buddhi Archives",
  description: "An App to manage Buddhi Archives",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={``}
      >
        {children}
      </body>
    </html>
  );
}
