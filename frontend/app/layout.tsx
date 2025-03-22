import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KeyMap",
  description: "Database Schema Generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sfpro antialiased"
      >
        {children}
      </body>
    </html>
  );
}
