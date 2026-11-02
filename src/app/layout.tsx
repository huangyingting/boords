import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Boords — Storyboard, Script & Animatic Software for Modern Video Teams",
  description:
    "Pre-production software for modern video teams. Write AV scripts, generate AI storyboards with character consistency, build animatics, and gather client feedback.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F6F6F0] text-[#121212] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
