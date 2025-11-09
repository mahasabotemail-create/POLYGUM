'use client';

import { useMemo, useState } from "react";

export type ProposalItem = {
  id: number;
  projectId: number;
  projectName: string;
  employer: string;
  city: string;
  status: "draft" | "sent";
  createdAt: string;
};

const STATUS_LABELS: Record<ProposalItem["status"], string> = {
  draft: "پیش‌نویس",
  sent: "ارسال شده",
};

export default function ProposalsBoard({ proposals }: { proposals: ProposalItem[] }) {
  const [filter, setFilter] = useState<ProposalItem["status"] | "all">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return proposals;
    return proposals.filter((proposal) => proposal.status === filter);
  }, [filter, proposals]);

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-border/40 bg-surface p-6 shadow-lg shadow-black/30">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">پروپوزال‌ها</h2>
          <p className="text-sm text-muted">
            پیگیری وضعیت آماده‌سازی و ارسال پروپوزال برای پروژه‌های ثبت شده.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm font-medium">
          {[
            { key: "all", label: "همه" },
            { key: "draft", label: "پیش‌نویس" },
            { key: "sent", label: "ارسال شده" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as ProposalItem["status"] | "all")}
              className={[
                "rounded-full px-4 py-2 transition",
                filter === key
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface-muted/60 text-muted hover:text-foreground",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((proposal) => (
          <article
            key={proposal.id}
            className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-surface-elevated/40 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-base font-semibold text-foreground">
                  {proposal.projectName}
                </span>
                <span className="text-xs text-muted">
                  {proposal.employer} • {proposal.city}
                </span>
              </div>
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  proposal.status === "sent"
                    ? "bg-success/20 text-success"
                    : "bg-warning/20 text-warning",
                ].join(" ")}
              >
                {STATUS_LABELS[proposal.status]}
              </span>
            </div>
            <div className="rounded-xl border border-border/40 bg-surface-muted/50 px-3 py-2 text-xs text-muted">
              تاریخ ایجاد:{" "}
              {new Date(proposal.createdAt).toLocaleString("fa-IR", {
                dateStyle: "short",
              })}
            </div>
            <button className="mt-auto inline-flex items-center justify-center rounded-full border border-accent/60 bg-transparent px-4 py-2 text-sm text-accent transition hover:bg-accent hover:text-accent-foreground">
              مشاهده جزئیات فنی
            </button>
          </article>
        ))}
        {!filtered.length && (
          <div className="col-span-full rounded-2xl border border-border/40 bg-surface-elevated/40 px-4 py-8 text-center text-sm text-muted">
            پروپوزالی با این فیلتر پیدا نشد.
          </div>
        )}
      </div>
    </section>
  );
}
