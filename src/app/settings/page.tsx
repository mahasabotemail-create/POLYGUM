import SettingsForm from "@/components/settings/settings-form";
import { getIntegrationSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getIntegrationSettings();

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      <SettingsForm initialValues={settings} />
      <section className="rounded-3xl border border-border/40 bg-surface-elevated/40 p-6 shadow-lg shadow-black/30">
        <h2 className="text-lg font-semibold text-foreground">راهنما</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted leading-6">
          <li>
            • آدرس Webhook باید شامل پروتکل (https://) باشد و از n8n درگاه امن
            دریافت شده باشد.
          </li>
          <li>• کلید OpenAI با پیشوند <span className="rounded bg-surface-muted px-2 py-0.5 text-xs text-muted">sk-</span> آغاز می‌شود. آن را محرمانه نگه دارید.</li>
          <li>• پس از بروزرسانی تنظیمات، ارسال فرم پروژه به صورت خودکار از مقادیر جدید استفاده می‌کند.</li>
        </ul>
      </section>
    </div>
  );
}
