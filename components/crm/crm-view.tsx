'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { Prisma, Project, Proposal } from '@prisma/client';

type CRMProject = Project & {
  proposals: Proposal[];
};

type Stats = {
  total: number;
  newProjects: number;
  withProposals: number;
};

type ProposalPayload = {
  openAi?: {
    success?: boolean;
    message?: string;
    summary?: string;
  };
  n8n?: {
    success?: boolean;
    message?: string;
    status?: number;
  };
};

function parseProposalData(value: Prisma.JsonValue | null): ProposalPayload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as ProposalPayload;
}

const searchInputClass =
  'w-full rounded-full border border-border/70 bg-background/80 px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30';

export default function CRMView({ initialProjects }: { initialProjects: CRMProject[] }) {
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState<CRMProject[]>(initialProjects);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/projects${query ? `?q=${encodeURIComponent(query)}` : ''}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('امکان دریافت پروژه‌ها وجود ندارد.');
        }
        const data = await response.json();
        setProjects(data.projects ?? []);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'خطای نامشخص رخ داد.');
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  const stats: Stats = useMemo(() => {
    const total = projects.length;
    const newProjects = projects.filter((project) => project.status === 'جدید').length;
    const withProposals = projects.filter((project) => project.proposals?.length > 0).length;
    return { total, newProjects, withProposals };
  }, [projects]);

  const formatDate = (value: string | Date) => {
    try {
      const date = new Date(value);
      return new Intl.DateTimeFormat('fa-IR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return '-';
    }
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <div className="space-y-8">
      <header className="rounded-[var(--radius-card)] border border-border/60 bg-surface/70 p-6 shadow-[var(--shadow-panel)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">CRM پروژه‌ها</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              پروژه‌های ثبت شده با امکان جست‌وجو بر اساس نام، کارفرما، شهر یا فروشنده.
            </p>
          </div>
          <div className="w-full max-w-sm">
            <input
              value={query}
              onChange={handleSearch}
              className={searchInputClass}
              placeholder="جستجو: نام پروژه، کارفرما یا شهر..."
            />
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="کل پروژه‌های ثبت شده" value={stats.total.toLocaleString('fa-IR')} accent="bg-accent/15" />
        <StatsCard title="پروژه‌های در وضعیت «جدید»" value={stats.newProjects.toLocaleString('fa-IR')} accent="bg-amber-500/20" />
        <StatsCard title="پروژه‌های دارای خروجی فنی" value={stats.withProposals.toLocaleString('fa-IR')} accent="bg-emerald-500/20" />
      </section>

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-[var(--radius-card)] border border-border/60 bg-surface/70 shadow-[var(--shadow-panel)]">
        <table className="min-w-full divide-y divide-border/60 text-sm">
          <thead className="bg-background/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-right">پروژه</th>
              <th className="px-4 py-3 text-right">کارفرما / شهر</th>
              <th className="px-4 py-3 text-right">فروشنده</th>
              <th className="px-4 py-3 text-right">وضعیت</th>
              <th className="px-4 py-3 text-right">تاریخ ثبت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-sm">
            {projects.map((project) => {
              const latestProposal = project.proposals?.[0];
              const proposalPayload = parseProposalData(latestProposal?.proposalData ?? null);
              return (
                <tr key={project.id} className="hover:bg-background/40">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{project.projectName}</div>
                    {proposalPayload?.openAi?.summary && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        خلاصه فنی: {proposalPayload.openAi.summary}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div>{project.employer ?? '—'}</div>
                    <div className="text-xs text-muted-foreground/70">{project.city ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div>{project.salesName}</div>
                    <div className="text-xs text-muted-foreground/70">{project.salesPhone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(project.createdAt)}</td>
                </tr>
              );
            })}
            {projects.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  پروژه‌ای مطابق جستجو یافت نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && (
          <div className="border-t border-border/60 bg-background/40 px-4 py-3 text-center text-xs text-muted-foreground">
            در حال بارگیری...
          </div>
        )}
      </section>
    </div>
  );
}

function StatsCard({ title, value, accent }: { title: string; value: string; accent: string }) {
  return (
    <div className={`rounded-[var(--radius-card)] border border-border/60 bg-background/60 p-5 shadow-[var(--shadow-panel)] ${accent}`}>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase();
  let classes = 'bg-muted/60 text-muted-foreground border border-border/40';
  let label = status;

  if (normalized === 'جدید') {
    classes = 'bg-amber-500/20 text-amber-200 border border-amber-500/30';
    label = 'جدید';
  } else if (normalized === 'در حال بررسی') {
    classes = 'bg-blue-500/15 text-blue-200 border border-blue-500/30';
  } else if (normalized === 'تکمیل شده' || normalized === 'موفق') {
    classes = 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40';
  }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}
