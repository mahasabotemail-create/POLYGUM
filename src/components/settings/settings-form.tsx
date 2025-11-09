'use client';

import type { FormEvent } from "react";
import { useState } from "react";

type SettingsPayload = {
  N8N_WEBHOOK_URL: string;
  POLIGAM_AI_KEY: string;
};

export default function SettingsForm({
  initialValues,
}: {
  initialValues: Partial<SettingsPayload>;
}) {
  const [values, setValues] = useState<Partial<SettingsPayload>>(initialValues);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "idle";
    message?: string;
  }>({ type: "idle" });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof SettingsPayload, value: string) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "idle" });

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setStatus({
          type: "error",
          message: data.message || "ذخیره تنظیمات با خطا مواجه شد.",
        });
        setLoading(false);
        return;
      }

      setValues(data.settings);
      setStatus({ type: "success", message: "تنظیمات با موفقیت ذخیره شد." });
      setLoading(false);
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message: "اتصال به سرور برقرار نشد.",
      });
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-3xl border border-border/40 bg-surface p-6 shadow-lg shadow-black/30"
    >
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          تنظیمات یکپارچه‌سازی
        </h1>
        <p className="mt-2 text-sm text-muted">
          مقادیر زیر برای ارسال خودکار اطلاعات به n8n و مغز فنی پلی‌گام استفاده
          می‌شوند.
        </p>
      </div>
      <label className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-surface-elevated/40 p-4 text-sm">
        <span className="text-foreground">آدرس Webhook در n8n</span>
        <input
          type="url"
          dir="ltr"
          value={values.N8N_WEBHOOK_URL ?? ""}
          placeholder="https://n8n.example.com/webhook/poligam"
          onChange={(event) =>
            handleChange("N8N_WEBHOOK_URL", event.target.value)
          }
          className="rounded-xl border border-border/40 bg-surface-muted/60 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <span className="text-xs text-muted">
          لینک اجرای workflow که داده‌های پروژه را دریافت می‌کند.
        </span>
      </label>

      <label className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-surface-elevated/40 p-4 text-sm">
        <span className="text-foreground">کلید API مغز فنی (OpenAI)</span>
        <input
          type="password"
          dir="ltr"
          value={values.POLIGAM_AI_KEY ?? ""}
          placeholder="sk-..."
          onChange={(event) =>
            handleChange("POLIGAM_AI_KEY", event.target.value)
          }
          className="rounded-xl border border-border/40 bg-surface-muted/60 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <span className="text-xs text-muted">
          کلید سرویس OpenAI برای ارسال درخواست به مغز فنی پلی‌گام.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-full bg-accent py-3 text-base font-semibold text-accent-foreground transition hover:bg-[#e5b800] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "در حال ذخیره..." : "ذخیره تنظیمات"}
      </button>

      {status.type === "success" && status.message && (
        <div className="rounded-2xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          {status.message}
        </div>
      )}
      {status.type === "error" && status.message && (
        <div className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {status.message}
        </div>
      )}
    </form>
  );
}
