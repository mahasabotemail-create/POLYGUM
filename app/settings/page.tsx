import SettingsForm from '@/components/settings/settings-form';
import { getIntegrationSettings } from '@/lib/integration-settings';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getIntegrationSettings();

  return (
    <div className="space-y-6">
      <header className="rounded-[var(--radius-card)] border border-border/60 bg-surface/70 p-6 shadow-[var(--shadow-panel)]">
        <h2 className="text-xl font-semibold text-foreground">تنظیمات یکپارچه‌سازی</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          مسیرهای اتوماسیون (n8n) و کلید مغز فنی پلی‌گام را در این بخش مدیریت کنید.
        </p>
      </header>
      <section className="rounded-[var(--radius-card)] border border-border/60 bg-surface/70 p-6 shadow-[var(--shadow-panel)]">
        <SettingsForm
          initialN8nWebhookUrl={settings.n8nWebhookUrl}
          initialPoligamAiKey={settings.poligamAiKey}
        />
      </section>
      <section className="rounded-[var(--radius-card)] border border-border/40 bg-background/50 p-6 text-xs text-muted-foreground">
        <h3 className="text-sm font-semibold text-foreground">نکات امنیتی</h3>
        <ul className="mt-3 list-disc space-y-2 pr-6">
          <li>کلیدهای API در پایگاه داده داخلی پروژه ذخیره می‌شوند و فقط برای سرور قابل مشاهده هستند.</li>
          <li>برای جلوگیری از افشای اطلاعات، از به‌اشتراک‌گذاری این صفحه در محیط‌های عمومی خودداری کنید.</li>
          <li>در صورت تغییر آدرس n8n، ابتدا در `.env.local` مقدار جدید را ثبت و سپس این صفحه را به‌روزرسانی کنید.</li>
        </ul>
      </section>
    </div>
  );
}
