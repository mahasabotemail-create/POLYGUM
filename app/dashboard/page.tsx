import type { Prisma } from '@prisma/client';

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [projects, statusGroups, proposalsCount, latestProjects] = await Promise.all([
    prisma.project.count(),
    prisma.project.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.proposal.count(),
    prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        proposals: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
  ]);

  const statusMap = statusGroups.reduce<Record<string, number>>((acc, group) => {
    acc[group.status] = group._count;
    return acc;
  }, {});

  const newCount = statusMap['جدید'] ?? 0;
  const inProgressCount = statusMap['در حال بررسی'] ?? 0;

  return (
    <div className="space-y-8">
      <header className="rounded-[var(--radius-card)] border border-border/60 bg-surface/70 p-6 shadow-[var(--shadow-panel)]">
        <h2 className="text-xl font-semibold text-foreground">داشبورد هوشمند پروژه‌های پلی‌گام</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          مرور سریع وضعیت پروژه‌ها، خروجی‌های فنی و آخرین فعالیت‌ها برای هماهنگی بهتر تیم فروش و فنی.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStat
          label="کل پروژه‌های فعال"
          value={projects.toLocaleString('fa-IR')}
          sublabel="شامل تمام وضعیت‌های جاری"
          accent="bg-accent/15"
        />
        <DashboardStat
          label="پروژه‌های تازه ثبت شده"
          value={newCount.toLocaleString('fa-IR')}
          sublabel="منتظر بررسی فنی"
          accent="bg-amber-500/20"
        />
        <DashboardStat
          label="پروژه در حال بررسی"
          value={inProgressCount.toLocaleString('fa-IR')}
          sublabel="در حال آماده‌سازی پروپوزال"
          accent="bg-blue-500/20"
        />
        <DashboardStat
          label="پروپوزال‌های تولید شده"
          value={proposalsCount.toLocaleString('fa-IR')}
          sublabel="خروجی‌های مغز فنی"
          accent="bg-emerald-500/20"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[var(--radius-card)] border border-border/60 bg-surface/70 p-6 shadow-[var(--shadow-panel)]">
          <h3 className="text-base font-semibold text-foreground">وضعیت کلی پروژه‌ها</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            سهم هر وضعیت نسبت به مجموع پروژه‌ها برای برنامه‌ریزی ظرفیت تیم‌ها.
          </p>
          <div className="mt-6 space-y-4">
            {['جدید', 'در حال بررسی', 'تکمیل شده'].map((status) => {
              const value = statusMap[status] ?? 0;
              const percentage = projects ? Math.round((value / projects) * 100) : 0;
              const barColor =
                status === 'جدید'
                  ? 'bg-amber-500'
                  : status === 'در حال بررسی'
                    ? 'bg-blue-500'
                    : 'bg-emerald-500';
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{status}</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-background/60">
                    <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-[var(--radius-card)] border border-border/60 bg-surface/70 p-6 shadow-[var(--shadow-panel)]">
          <h3 className="text-base font-semibold text-foreground">بیشترین فعالیت مغز فنی</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            پروپوزال‌هایی که به‌تازگی با موفقیت تولید شده‌اند.
          </p>
          <div className="mt-6 space-y-4">
            {latestProjects.map((project) => {
              const proposal = project.proposals?.[0];
              const dateLabel = new Intl.DateTimeFormat('fa-IR', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(project.createdAt);
              return (
                <div key={project.id} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{dateLabel}</span>
                    <span>{project.status}</span>
                  </div>
                  <h4 className="mt-2 text-sm font-semibold text-foreground">{project.projectName}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    کارفرما: {project.employer ?? 'نامشخص'} — شهر {project.city ?? 'نامشخص'}
                  </p>
                  {proposal?.proposalData && (
                    <p className="mt-2 text-xs leading-6 text-foreground/80">
                      خلاصه: {extractSummary(proposal.proposalData)}
                    </p>
                  )}
                </div>
              );
            })}
            {latestProjects.length === 0 && (
              <div className="rounded-2xl border border-border/60 bg-background/60 p-6 text-center text-xs text-muted-foreground">
                هنوز داده‌ای برای نمایش وجود ندارد.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function DashboardStat({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string;
  value: string;
  sublabel: string;
  accent: string;
}) {
  return (
    <div className={`rounded-[var(--radius-card)] border border-border/60 bg-surface/70 p-6 shadow-[var(--shadow-panel)] ${accent}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className="mt-4 text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{sublabel}</p>
    </div>
  );
}

function extractSummary(data: Prisma.JsonValue | null): string {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return '—';
  const record = data as Record<string, unknown>;
  const openAi = record['openAi'];
  if (openAi && typeof openAi === 'object' && !Array.isArray(openAi) && 'summary' in openAi) {
    return ((openAi as Record<string, unknown>).summary as string) || '—';
  }
  return '—';
}
