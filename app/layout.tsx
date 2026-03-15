import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { BaseColorProvider } from "@/components/providers/BaseColorProvider";
import { ToastProvider } from "@/components/providers/Toast";
import RegisterSW from "@/components/providers/RegisterSW";
import { HideAmountsProvider } from "@/lib/HideAmountsContext";

export const viewport: Viewport = {
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: "Keuangan Kita",
  description: "Aplikasi pengelola keuangan sederhana untuk keluarga atau kelompok kecil.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
    shortcut: "/icons/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Keuangan Kita",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var bgMap={light:'#ffffff',dark:'#111827'};
            var meta=document.querySelector('meta[name="theme-color"]');
            if(!meta) return;
            var stored=localStorage.getItem('theme');
            var dark=stored==='dark'||(stored==null&&window.matchMedia('(prefers-color-scheme: dark)').matches);
            meta.content=dark?bgMap.dark:bgMap.light;
          })();
        `}} />
      </head>
      <body className="antialiased bg-white dark:bg-gray-900 min-h-screen">
        <ThemeProvider>
          <BaseColorProvider>
          <HideAmountsProvider>
          <RegisterSW />
          <div className="max-w-lg mx-auto min-h-screen bg-white dark:bg-gray-900 shadow-sm dark:shadow-none relative">
            <ToastProvider>
              <main className="pb-20">{children}</main>
              <BottomNav />
            </ToastProvider>
          </div>
          </HideAmountsProvider>
          </BaseColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
