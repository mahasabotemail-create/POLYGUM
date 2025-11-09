import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import MainNav from "@/components/layout/main-nav";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "پلی‌گام | پنل مدیریت پروژه",
  description: "پنل وب مینیمال پلی‌گام برای مدیریت پروژه‌ها و مشتریان",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${vazirmatn.variable} antialiased bg-background text-foreground`}
      >
        <div className="flex min-h-screen flex-col bg-background">
          <MainNav />
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
