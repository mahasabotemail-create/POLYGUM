'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { Prisma, Project, Proposal } from '@prisma/client';

type ProposalWithProject = Proposal & {
  project: Project;
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

const FILTERS = [
  { key: 'all', label: 'همه' },
  { key: 'draft', label: 'پیش‌نویس' },
  { key: 'sent', label: 'ارسال‌شده' },
] as const;

function parseProposalData(value: Prisma.JsonValue | null): ProposalPayload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as ProposalPayload;
}

export default function ProposalsView({ initialProposals }: { initialProposals: ProposalWithProject[] }) {
  const [status, setStatus] = useState<(typeof FILTERS)[number]['key']>('all');
  const [query, setQuery] = useState('');
  const [proposals, setProposals] = useState<ProposalWithProject[]>(initialProposals);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (status !== 'all') params.set('status', status);
        if (query) params.set('projectId', query);
        const url = `/api/proposals${params.toString() ? `?${params.toString()}` : ''}`;

        const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('امکان دریافت پروپوزال‌ها وجود ندارد.');
        const data = await response.json();
        setProposals(data.proposals ?? []);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'خطای نامشخص رخ داد.');
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [status, query]);

  const groupedByProject = useMemo(() => {
    return proposals.reduce<Record<number, ProposalWithProject[]>>((acc, proposal) => {
      const projectId = proposal.projectId;
      if (!acc[projectId]) acc[projectId] = [];
      acc[projectId].push(proposal);
      return acc;
    }, {});
  }, [proposals]);

  const formatDate = (value: string | Date) =>
    new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

  const handleFilterChange = (key: (typeof FILTERS)[number]['key']) => () => {
    setStatus(key);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <div className="space-y-6">
      <header className="rounded-[var(--radius-card)] border border-border/60 bg-surface/70 p-6 shadow-[var(--shadow-panel)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">پروپوزال‌ها و خروجی‌های فنی</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              وضعیت تولید و ارسال پروپوزال‌های فنی برای هر پروژه را در یک نگاه ببینید.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex rounded-full border border-border/60 bg-background/60 p-1">
              {FILTERS.map((filter) => {
                const active = status === filter.key;
                return (
                  <button
                    key={filter.key}
                    onClick={handleFilterChange(filter.key)}
                    type="button"
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      active
                        ? 'bg-accent text-black shadow-[0_18px_30px_-20px_rgba(217,168,0,0.8)]'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
            <input
              className="w-full rounded-full border border-border/70 bg-background/70 px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="فیلتر بر اساس شناسه پروژه..."
              value={query}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="space-y-5">
        {Object.entries(groupedByProject).map(([projectId, projectProposals]) => {
          const project = projectProposals[0].project;
          return (
            <div
              key={projectId}
              className="rounded-[var(--radius-card)] border border-border/60 bg-surface/70 p-6 shadow-[var(--shadow-panel)]"
            >
              <div className="flex flex-col gap-2 border-b border-border/40 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{project.projectName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {project.employer ?? 'کارفرما ثبت نشده'} — شهر {project.city ?? 'نامشخص'}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] text-muted-foreground">
                  شناسه پروژه: {projectId}
                </span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {projectProposals.map((proposal) => {
                  const payload = parseProposalData(proposal.proposalData ?? null);
                  return (
                    <article
                      key={proposal.id}
                      className="relative flex h-full flex-col gap-3 rounded-2xl border border-border/60 bg-background/50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                          {proposal.proposalStatus === 'sent' ? 'ارسال شده' : 'پیش‌نویس'}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(proposal.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm leading-7 text-foreground">
                        {payload.openAi?.summary ?? 'خلاصه‌ای از مغز فنی هنوز تولید نشده است.'}
                      </p>
                      <div className="mt-auto space-y-2 text-xs text-muted-foreground">
                        <IntegrationBadge
                          label="مغز فنی"
                          success={payload.openAi?.success ?? false}
                          message={payload.openAi?.message}
                        />
                        <IntegrationBadge
                          label="n8n"
                          success={payload.n8n?.success ?? false}
                          message={payload.n8n?.message}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {Object.keys(groupedByProject).length === 0 && !loading && (
        <div className="rounded-[var(--radius-card)] border border-border/60 bg-surface/70 p-8 text-center text-sm text-muted-foreground">
          هنوز پروپوزالی ثبت نشده است.
        </div>
      )}

      {loading && (
        <div className="rounded-[var(--radius-card)] border border-border/60 bg-background/60 px-4 py-3 text-center text-xs text-muted-foreground">
          در حال به‌روزرسانی لیست پروپوزال‌ها...
        </div>
      )}
    </div>
  );
}

function IntegrationBadge({
  label,
  success,
  message,
}: {
  label: string;
  success: boolean;
  message?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
        success ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-red-500/30 bg-red-500/10 text-red-200'
      }`}
    >
      <span className="font-semibold">{label}</span>
      <span className="text-[11px]">{message ?? (success ? 'موفق' : 'خطا')}</span>
    </div>
  );
}
