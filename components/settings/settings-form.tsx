'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';

type SettingsFormProps = {
  initialN8nWebhookUrl: string;
  initialPoligamAiKey: string;
};

const inputClass =
  'w-full rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30';

export default function SettingsForm({ initialN8nWebhookUrl, initialPoligamAiKey }: SettingsFormProps) {
  const [form, setForm] = useState({
    n8nWebhookUrl: initialN8nWebhookUrl,
    poligamAiKey: initialPoligamAiKey,
  });
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({
    type: 'idle',
  });

  const handleChange =
    (field: 'n8nWebhookUrl' | 'poligamAiKey') => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const toggleShowKey = () => setShowKey((prev) => !prev);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: 'idle' });

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus({
          type: 'error',
          message: data.message ?? 'خطا در ذخیره تنظیمات.',
        });
        return;
      }
      setForm({
        n8nWebhookUrl: data.settings?.n8nWebhookUrl ?? '',
        poligamAiKey: data.settings?.poligamAiKey ?? '',
      });
      setStatus({
        type: 'success',
        message: data.message ?? 'تنظیمات با موفقیت ذخیره شد.',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'خطای غیرمنتظره‌ای رخ داد.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-sm font-semibold text-muted-foreground">Webhook n8n</label>
        <input
          className={inputClass}
          placeholder="https://example.n8n.cloud/webhook/poligam"
          value={form.n8nWebhookUrl}
          onChange={handleChange('n8nWebhookUrl')}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          آدرسی که داده‌های پروژه پس از ثبت برای زنجیره اتوماسیون ارسال می‌شود.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-muted-foreground">کلید API مغز فنی</label>
        <div className="relative flex items-center">
          <input
            className={`${inputClass} pr-24`}
            type={showKey ? 'text' : 'password'}
            placeholder="sk-..."
            value={form.poligamAiKey}
            onChange={handleChange('poligamAiKey')}
          />
          <button
            type="button"
            onClick={toggleShowKey}
            className="absolute left-3 rounded-full border border-border/50 bg-background/70 px-3 py-1 text-xs text-muted-foreground transition hover:border-accent/60 hover:text-foreground"
          >
            {showKey ? 'مخفی' : 'نمایش'}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          کلید دسترسی به OpenAI برای تولید خلاصه فنی. در صورت خالی بودن، مقدار محیطی استفاده می‌شود.
        </p>
      </div>

      {status.type !== 'idle' && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            status.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
              : 'border-red-500/40 bg-red-500/10 text-red-200'
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          تنظیمات ذخیره شده در پایگاه داده نگهداری می‌شوند و در صورت نبود مقدار، از .env.local خوانده می‌شود.
        </p>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black shadow-[0_20px_40px_-20px_rgba(217,168,0,0.8)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-accent/40 disabled:translate-y-0 disabled:opacity-60"
        >
          {loading ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
        </button>
      </div>
    </form>
  );
}
