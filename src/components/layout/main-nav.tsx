'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const NAV_ITEMS = [
  { href: "/", label: "ثبت پروژه" },
  { href: "/crm", label: "CRM" },
  { href: "/proposals", label: "پروپوزال‌ها" },
  { href: "/dashboard", label: "داشبورد" },
  { href: "/settings", label: "تنظیمات" },
];

export default function MainNav() {
  const pathname = usePathname();

  const activePath = useMemo(() => {
    if (!pathname) return "/";
    if (pathname === "/") return "/";

    const matched = NAV_ITEMS.find((item) =>
      item.href !== "/" ? pathname.startsWith(item.href) : pathname === "/",
    );

    return matched?.href ?? "/";
  }, [pathname]);

  return (
    <header className="border-border/40 bg-surface shadow-sm border-b">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-accent text-lg font-semibold">Poligam</span>
            <span className="text-sm text-muted">پنل مدیریت پروژه پلی‌گام</span>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
          {NAV_ITEMS.map((item) => {
            const isActive = activePath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-full px-4 py-2 transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground shadow"
                    : "text-muted hover:bg-surface-muted hover:text-foreground",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
