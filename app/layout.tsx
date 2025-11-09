import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';

import PanelShell from '@/components/layout/panel-shell';

import './globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-vazirmatn',
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'پلی‌گام | پنل مدیریت پروژه',
  description: 'پنل وب مینیمال پلی‌گام برای ثبت و رهگیری پروژه‌های صنعتی.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} bg-background text-foreground antialiased`}>
        <PanelShell>{children}</PanelShell>
      </body>
    </html>
  );
}
