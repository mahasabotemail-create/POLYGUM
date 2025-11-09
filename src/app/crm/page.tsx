import ProjectsTable, {
  type CRMProject,
} from "@/components/crm/projects-table";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const formatProjects = async (): Promise<CRMProject[]> => {
  const projects = await prisma.project.findMany({
    include: {
      proposals: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects.map((project) => ({
    id: project.id,
    salesName: project.salesName,
    salesPhone: project.salesPhone,
    projectName: project.projectName,
    employer: project.employer,
    city: project.city,
    totalArea: project.totalArea,
    substrateType: project.substrateType,
    visitDateSh: project.visitDateSh,
    status: project.status,
    createdAt: project.createdAt.toISOString(),
    proposals: project.proposals.map((proposal) => ({
      id: proposal.id,
      proposalStatus: proposal.proposalStatus,
      createdAt: proposal.createdAt.toISOString(),
    })),
  }));
};

export default async function CRMPage() {
  const projects = await formatProjects();

  const total = projects.length;
  const withProposals = projects.filter((p) => p.proposals.length > 0).length;

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      <section className="rounded-3xl border border-border/40 bg-surface-elevated/40 p-6 shadow-lg shadow-black/30">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border/30 bg-surface p-4">
            <div className="text-sm text-muted">کل پروژه‌ها</div>
            <div className="mt-2 text-2xl font-semibold text-foreground">
              {total.toLocaleString("fa-IR")}
            </div>
          </div>
          <div className="rounded-2xl border border-border/30 bg-surface p-4">
            <div className="text-sm text-muted">پروژه‌های دارای پروپوزال</div>
            <div className="mt-2 text-2xl font-semibold text-foreground">
              {withProposals.toLocaleString("fa-IR")}
            </div>
          </div>
          <div className="rounded-2xl border border-border/30 bg-surface p-4">
            <div className="text-sm text-muted">پروژه‌های جدید</div>
            <div className="mt-2 text-2xl font-semibold text-foreground">
              {
                projects.filter((project) => project.status === "جدید").length
              }
            </div>
          </div>
          <div className="rounded-2xl border border-border/30 bg-surface p-4">
            <div className="text-sm text-muted">آخرین بروزرسانی</div>
            <div className="mt-2 text-sm text-foreground">
              {projects[0]
                ? new Date(projects[0].createdAt).toLocaleString("fa-IR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                : "بدون داده"}
            </div>
          </div>
        </div>
      </section>

      <ProjectsTable projects={projects} />
    </div>
  );
}
