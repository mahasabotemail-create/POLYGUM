'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type NavItem = {
  href: string;
  label: string;
  description?: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'ثبت پروژه جدید', description: 'ورود اطلاعات پروژه و ارسال یکپارچه' },
  { href: '/crm', label: 'CRM', description: 'لیست پروژه‌ها و مشتریان' },
  { href: '/proposals', label: 'پروپوزال‌ها', description: 'وضعیت تولید و ارسال' },
  { href: '/dashboard', label: 'داشبورد', description: 'نمای کلی وضعیت پروژه‌ها' },
  { href: '/settings', label: 'تنظیمات', description: 'مدیریت یکپارچه‌سازی‌ها' },
];

export default function PanelShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              شرکت پلی‌گام
            </p>
            <h1 className="mt-1 text-2xl font-bold text-accent">پنل مدیریت پروژه صنعتی</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group rounded-full border px-4 py-2 transition ${
                    isActive
                      ? 'border-accent bg-accent text-black shadow-[0_8px_30px_-12px_rgba(217,168,0,0.75)]'
                      : 'border-transparent bg-muted/70 text-muted-foreground hover:border-accent/60 hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border/60 bg-surface/60 py-6 text-center text-xs text-muted-foreground">
        پلی‌گام © {new Date().getFullYear()} — محور نوآوری در کف‌پوش صنعتی
      </footer>
    </div>
  );
}
