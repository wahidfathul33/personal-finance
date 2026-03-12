import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BaseColorProvider } from "@/components/BaseColorProvider";
import { ToastProvider } from "@/components/Toast";
import RegisterSW from "@/components/RegisterSW";

export const viewport: Viewport = {
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: "Keuangan Kita",
  description: "Aplikasi pengelola keuangan sederhana untuk keluarga atau kelompok kecil.",
  manifest: "/manifest.json",
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
            var colorMap={indigo:'#4f46e5',violet:'#7c3aed',rose:'#e11d48',emerald:'#059669',blue:'#2563eb',amber:'#d97706',pink:'#db2777',teal:'#0d9488'};
            var bgMap={light:'#ffffff',dark:'#111827'};
            var meta=document.querySelector('meta[name="theme-color"]');
            if(!meta) return;
            if(window.location.pathname==='/'){
              var base=localStorage.getItem('baseColor')||'indigo';
              meta.content=colorMap[base]||colorMap.indigo;
            } else {
              var stored=localStorage.getItem('theme');
              var dark=stored==='dark'||(stored==null&&window.matchMedia('(prefers-color-scheme: dark)').matches);
              meta.content=dark?bgMap.dark:bgMap.light;
            }
          })();
        `}} />
      </head>
      <body className="antialiased bg-white dark:bg-gray-900 min-h-screen">
        <ThemeProvider>
          <BaseColorProvider>
          <RegisterSW />
          <div className="max-w-lg mx-auto min-h-screen bg-white dark:bg-gray-900 shadow-sm relative">
            <ToastProvider>
              <main className="pb-20">{children}</main>
              <BottomNav />
            </ToastProvider>
          </div>
          </BaseColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
