'use client';

import type { FormEvent } from "react";
import { useState } from "react";

type IntegrationResult = {
  success: boolean;
  message: string;
  response: unknown;
};

type ProjectResponse = {
  success: boolean;
  message?: string;
  project?: {
    id: number;
    projectName: string;
  };
  integrations?: {
    crm: IntegrationResult;
    n8n: IntegrationResult;
    openai: IntegrationResult;
  };
  missing?: string[];
};

const FIELD_LABELS: Record<string, string> = {
  sales_name: "نام کارشناس فروش",
  sales_phone: "شماره تماس فروش",
  project_name: "نام پروژه",
  employer: "نام کارفرما / سازمان",
  city: "شهر پروژه",
  total_area: "مساحت کل (متر مربع)",
  substrate_type: "نوع بستر",
  visit_date_sh: "تاریخ بازدید (شمسی)",
};

export default function ProjectForm() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ProjectResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setResponse(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload: Record<string, string> = {};

    formData.forEach((value, key) => {
      payload[key] = String(value).trim();
    });

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as ProjectResponse;

      if (!res.ok || !data.success) {
        setError(
          data.message ||
            "ارسال اطلاعات با خطا مواجه شد. لطفاً تنظیمات و اتصال‌ها را بررسی کنید.",
        );
        setResponse(data);
        setLoading(false);
        return;
      }

      setResponse(data);
      setLoading(false);
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      setError("اتصال به سرور برقرار نشد.");
      setLoading(false);
    }
  };

  const renderStatusBadge = (result?: IntegrationResult) => {
    if (!result) return null;
    const baseClasses = "rounded-full px-3 py-1 text-xs font-medium";
    if (result.success) {
      return (
        <span className={`${baseClasses} bg-success/20 text-success`}>
          موفق
        </span>
      );
    }
    return (
      <span className={`${baseClasses} bg-danger/20 text-danger`}>ناموفق</span>
    );
  };

  return (
    <section className="flex w-full flex-col gap-6 rounded-3xl bg-surface p-6 shadow-lg shadow-black/30">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          فرم ثبت پروژه جدید
        </h1>
        <p className="mt-2 text-sm text-muted">
          پس از ثبت، اطلاعات هم‌زمان در CRM ذخیره شده و برای n8n و مغز فنی ارسال
          می‌شوند.
        </p>
      </div>
      <form
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
          {Object.entries(FIELD_LABELS).map(([name, label]) => {
            const optional = ["total_area", "visit_date_sh"].includes(name);
            return (
          <label
            key={name}
            className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-surface-elevated/40 p-4 text-sm"
          >
                <span className="flex items-center gap-2 text-foreground">
                  {label}
                  {!optional && (
                    <span className="text-xs font-semibold text-danger">*</span>
                  )}
                </span>
            <input
              name={name}
              type="text"
              dir={
                name === "sales_phone" || name === "total_area" ? "ltr" : "rtl"
              }
              inputMode={
                name === "sales_phone" || name === "total_area"
                  ? "numeric"
                  : "text"
              }
              className="rounded-xl border border-border/40 bg-surface-muted/60 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
              placeholder={label}
              required={
                  !optional
              }
              autoComplete="off"
            />
          </label>
            );
          })}
        <div className="md:col-span-2 flex flex-col gap-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-accent py-3 text-base font-semibold text-accent-foreground transition hover:bg-[#e5b800] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "در حال ارسال..." : "ثبت اطلاعات پروژه"}
          </button>
          {error && (
            <div className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
              {response?.missing?.length ? (
                <div className="mt-1 text-xs text-danger/80">
                  فیلدهای ناقص:{" "}
                  {response.missing
                    .map((field) => FIELD_LABELS[field] ?? field)
                    .join("، ")}
                </div>
              ) : null}
            </div>
          )}
          {response && !error && (
            <div className="rounded-2xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
              اطلاعات با موفقیت ذخیره شد.
            </div>
          )}
        </div>
      </form>

      {response?.integrations && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Object.entries(response.integrations).map(([key, result]) => (
            <div
              key={key}
              className="flex flex-col gap-2 rounded-2xl border border-border/40 bg-surface-elevated/40 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {key === "crm"
                    ? "ذخیره در CRM"
                    : key === "n8n"
                      ? "ارسال به n8n"
                      : "ارسال به مغز فنی"}
                </span>
                {renderStatusBadge(result)}
              </div>
              <p className="text-xs text-muted leading-5">{result.message}</p>
              {result.response ? (
                <pre className="max-h-28 overflow-auto rounded-xl bg-surface-muted/60 px-3 py-2 text-[11px] text-muted">
                  {typeof result.response === "string"
                    ? result.response
                    : JSON.stringify(result.response, null, 2)}
                </pre>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
