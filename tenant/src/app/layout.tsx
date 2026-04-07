import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Car Rental",
  description: "Browse and rent cars",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
