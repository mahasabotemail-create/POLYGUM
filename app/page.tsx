'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';

type ProjectForm = {
  salesName: string;
  salesPhone: string;
  projectName: string;
  employer: string;
  city: string;
  totalArea: string;
  substrateType: string;
  visitDateSh: string;
};

type FieldError = Partial<Record<keyof ProjectForm, string>>;

type IntegrationStatus = {
  success: boolean;
  message: string;
  status?: number;
};

type SubmissionState = 'idle' | 'success' | 'error' | 'partial';

const INITIAL_FORM: ProjectForm = {
  salesName: '',
  salesPhone: '',
  projectName: '',
  employer: '',
  city: '',
  totalArea: '',
  substrateType: '',
  visitDateSh: '',
};

const inputClassName =
  'w-full rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30';

export default function HomePage() {
  const [form, setForm] = useState<ProjectForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldError>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: SubmissionState; message?: string }>({
    type: 'idle',
  });
  const [integrations, setIntegrations] = useState<{
    n8n?: IntegrationStatus;
    openAi?: IntegrationStatus;
  }>({});

  const handleChange = (field: keyof ProjectForm) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: 'idle' });
    setErrors({});
    setIntegrations({});

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.status === 422 && data.issues) {
        setErrors(
          Object.entries(data.issues).reduce<FieldError>((acc, [key, value]) => {
            acc[key as keyof ProjectForm] = Array.isArray(value) ? value[0] : value;
            return acc;
          }, {}),
        );
        setStatus({ type: 'error', message: 'برخی فیلدها نیاز به اصلاح دارند.' });
        return;
      }

      setIntegrations({
        n8n: data.integrations?.n8n,
        openAi: data.integrations?.openAi,
      });

      if (response.ok) {
        setStatus({ type: 'success', message: data.message ?? 'اطلاعات با موفقیت ثبت شد.' });
        setForm(INITIAL_FORM);
      } else if (response.status === 207) {
        setStatus({
          type: 'partial',
          message: data.message ?? 'برخی یکپارچه‌سازی‌ها با خطا مواجه شدند.',
        });
      } else {
        setStatus({
          type: 'error',
          message: data.message ?? 'خطا در ثبت اطلاعات. لطفاً دوباره تلاش کنید.',
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'خطای غیرمنتظره رخ داد.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const statusClass =
    status.type === 'success'
      ? 'border-emerald-500/50 bg-emerald-600/10 text-emerald-300'
      : status.type === 'partial'
        ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
        : 'border-red-500/50 bg-red-600/10 text-red-300';

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-[var(--radius-card)] border border-border/70 bg-surface/80 p-8 shadow-[var(--shadow-panel)] backdrop-blur">
        <div className="mb-8 flex flex-col gap-2">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
            جریان ثبت پروژه
          </span>
          <h2 className="text-2xl font-bold text-foreground">فرم ثبت پروژه جدید</h2>
          <p className="text-sm text-muted-foreground">
            داده‌های وارد شده هم‌زمان در CRM ذخیره می‌شود، به n8n ارسال می‌گردد و برای مغز فنی پلی‌گام
            تحلیل می‌گردد.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">نام فروشنده*</label>
              <input
                className={inputClassName}
                placeholder="مثلاً: محمد رضایی"
                value={form.salesName}
                onChange={handleChange('salesName')}
                autoComplete="name"
                required
              />
              {errors.salesName && <p className="mt-2 text-xs text-red-400">{errors.salesName}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">شماره تماس فروش*</label>
              <input
                className={inputClassName}
                placeholder="0912XXXXXXX"
                value={form.salesPhone}
                onChange={handleChange('salesPhone')}
                autoComplete="tel"
                required
              />
              {errors.salesPhone && <p className="mt-2 text-xs text-red-400">{errors.salesPhone}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">نام پروژه*</label>
              <input
                className={inputClassName}
                placeholder="پروژه کف‌پوش کارخانه پلیمر"
                value={form.projectName}
                onChange={handleChange('projectName')}
                required
              />
              {errors.projectName && <p className="mt-2 text-xs text-red-400">{errors.projectName}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">کارفرما</label>
              <input
                className={inputClassName}
                placeholder="نام شرکت یا کارفرما"
                value={form.employer}
                onChange={handleChange('employer')}
              />
              {errors.employer && <p className="mt-2 text-xs text-red-400">{errors.employer}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">شهر پروژه</label>
              <input
                className={inputClassName}
                placeholder="مثلاً: اصفهان"
                value={form.city}
                onChange={handleChange('city')}
              />
              {errors.city && <p className="mt-2 text-xs text-red-400">{errors.city}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">متراژ کل (متر مربع)</label>
              <input
                className={inputClassName}
                placeholder="مثلاً: ۱۲۰۰"
                value={form.totalArea}
                onChange={handleChange('totalArea')}
              />
              {errors.totalArea && <p className="mt-2 text-xs text-red-400">{errors.totalArea}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">نوع زیرساخت</label>
              <input
                className={inputClassName}
                placeholder="بتن، فلز، موزاییک و ..."
                value={form.substrateType}
                onChange={handleChange('substrateType')}
              />
              {errors.substrateType && <p className="mt-2 text-xs text-red-400">{errors.substrateType}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">تاریخ بازدید (شمسی)</label>
              <input
                className={inputClassName}
                placeholder="۱۴۰۳/۰۹/۱۵"
                value={form.visitDateSh}
                onChange={handleChange('visitDateSh')}
              />
              {errors.visitDateSh && <p className="mt-2 text-xs text-red-400">{errors.visitDateSh}</p>}
            </div>
          </div>

          {status.type !== 'idle' && (
            <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${statusClass}`}>
              {status.message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black shadow-[0_22px_45px_-20px_rgba(217,168,0,0.9)] transition hover:-translate-y-0.5 hover:bg-[#e8b700] focus:outline-none focus:ring-4 focus:ring-accent/40 disabled:translate-y-0 disabled:opacity-70"
          >
            {submitting ? 'در حال ارسال...' : 'ثبت اطلاعات پروژه'}
          </button>
        </form>

        {(integrations.n8n || integrations.openAi) && (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {integrations.n8n && (
              <div className="rounded-2xl border border-border/80 bg-muted/70 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Webhook n8n</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      integrations.n8n.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {integrations.n8n.success ? 'موفق' : 'خطا'}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-6 text-muted-foreground">{integrations.n8n.message}</p>
              </div>
            )}
            {integrations.openAi && (
              <div className="rounded-2xl border border-border/80 bg-muted/70 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">مغز فنی پلی‌گام</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      integrations.openAi.success
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {integrations.openAi.success ? 'موفق' : 'خطا'}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-6 text-muted-foreground">
                  {integrations.openAi.message}
                  {integrations.openAi.status && (
                    <span className="mt-1 block text-[11px] text-muted-foreground/70">
                      وضعیت: {integrations.openAi.status}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </section>
      <aside className="flex flex-col gap-4">
        <div className="rounded-[var(--radius-card)] border border-border/60 bg-surface/70 p-6 shadow-[var(--shadow-panel)]">
          <h3 className="text-base font-semibold text-foreground">سه اقدام هم‌زمان</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="rounded-2xl border border-border/50 bg-background/40 p-3">
              <span className="font-semibold text-foreground">CRM داخلی:</span> ذخیره با وضعیت «جدید» و مهر تاریخ.
            </li>
            <li className="rounded-2xl border border-border/50 bg-background/40 p-3">
              <span className="font-semibold text-foreground">اتصال n8n:</span> ارسال JSON برای شروع اتوماسیون‌ها.
            </li>
            <li className="rounded-2xl border border-border/50 bg-background/40 p-3">
              <span className="font-semibold text-foreground">مغز فنی:</span> تولید خلاصه فنی برای تیم مهندسی.
            </li>
          </ul>
        </div>
        <div className="rounded-[var(--radius-card)] border border-accent/30 bg-accent/10 p-6 text-sm text-accent leading-7">
          <p className="font-semibold text-accent-foreground/90">راهنما</p>
          <p className="mt-3 text-accent-foreground/90">
            اطلاعات حساس نظیر کلید API و آدرس n8n را از مسیر تنظیمات وارد کنید. تا زمان ثبت موفق، دکمه ارسال
            غیرفعال می‌ماند.
          </p>
        </div>
      </aside>
    </div>
  );
}
