import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Personal finance tracker for Mas & Fita",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-100 dark:bg-gray-950 min-h-screen">
        <ThemeProvider>
          <div className="max-w-lg mx-auto min-h-screen bg-white dark:bg-gray-900 shadow-sm relative">
            <main className="pb-20">{children}</main>
            <BottomNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
