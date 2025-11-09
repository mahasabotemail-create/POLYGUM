import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const getDashboardData = async () => {
  const [totalProjects, newProjects, sentProposals, draftProposals, latest] =
    await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: "جدید" } }),
      prisma.proposal.count({ where: { proposalStatus: "sent" } }),
      prisma.proposal.count({ where: { proposalStatus: "draft" } }),
      prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const cityBreakdown = await prisma.project.groupBy({
    by: ["city"],
    _count: { city: true },
  });

  return {
    totalProjects,
    newProjects,
    sentProposals,
    draftProposals,
    latestProjects: latest.map((project) => ({
      id: project.id,
      projectName: project.projectName,
      employer: project.employer,
      city: project.city,
      status: project.status,
      createdAt: project.createdAt.toISOString(),
    })),
    cityBreakdown,
  };
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-border/40 bg-surface p-6 shadow-lg shadow-black/30">
          <div className="text-sm text-muted">کل پروژه‌ها</div>
          <div className="mt-3 text-3xl font-semibold text-foreground">
            {data.totalProjects.toLocaleString("fa-IR")}
          </div>
        </div>
        <div className="rounded-3xl border border-border/40 bg-surface p-6 shadow-lg shadow-black/30">
          <div className="text-sm text-muted">پروژه‌های جدید</div>
          <div className="mt-3 text-3xl font-semibold text-accent">
            {data.newProjects.toLocaleString("fa-IR")}
          </div>
        </div>
        <div className="rounded-3xl border border-border/40 bg-surface p-6 shadow-lg shadow-black/30">
          <div className="text-sm text-muted">پروپوزال‌های ارسال شده</div>
          <div className="mt-3 text-3xl font-semibold text-success">
            {data.sentProposals.toLocaleString("fa-IR")}
          </div>
        </div>
        <div className="rounded-3xl border border-border/40 bg-surface p-6 shadow-lg shadow-black/30">
          <div className="text-sm text-muted">پروپوزال‌های پیش‌نویس</div>
          <div className="mt-3 text-3xl font-semibold text-warning">
            {data.draftProposals.toLocaleString("fa-IR")}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-3xl border border-border/40 bg-surface p-6 shadow-lg shadow-black/30">
          <h2 className="text-lg font-semibold text-foreground">
            آخرین پروژه‌های ثبت شده
          </h2>
          <div className="flex flex-col gap-3">
            {data.latestProjects.length ? (
              data.latestProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-2xl border border-border/30 bg-surface-elevated/40 px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {project.projectName}
                    </div>
                    <div className="text-xs text-muted">
                      {project.employer} • {project.city}
                    </div>
                  </div>
                  <div className="text-xs text-muted">
                    {new Date(project.createdAt).toLocaleString("fa-IR", {
                      dateStyle: "short",
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-border/30 bg-surface-elevated/40 px-4 py-8 text-center text-sm text-muted">
                هنوز پروژه‌ای ثبت نشده است.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-border/40 bg-surface p-6 shadow-lg shadow-black/30">
          <h2 className="text-lg font-semibold text-foreground">توزیع پروژه‌ها از نظر شهر</h2>
          <div className="flex flex-col gap-3">
            {data.cityBreakdown.length ? (
              data.cityBreakdown.map((city) => (
                <div
                  key={city.city}
                  className="flex items-center justify-between rounded-2xl border border-border/30 bg-surface-elevated/40 px-4 py-3"
                >
                  <span className="text-sm text-foreground">
                    {city.city || "نامشخص"}
                  </span>
                  <span className="rounded-full bg-surface-muted/70 px-3 py-1 text-xs text-muted">
                    {city._count.city.toLocaleString("fa-IR")} پروژه
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-border/30 bg-surface-elevated/40 px-4 py-8 text-center text-sm text-muted">
                داده‌ای برای نمایش وجود ندارد.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
