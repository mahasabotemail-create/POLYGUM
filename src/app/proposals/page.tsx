import ProposalsBoard, {
  type ProposalItem,
} from "@/components/proposals/proposals-board";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fetchProposals = async (): Promise<ProposalItem[]> => {
  const proposals = await prisma.proposal.findMany({
    include: {
      project: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return proposals.map((proposal) => ({
    id: proposal.id,
    projectId: proposal.projectId,
    projectName: proposal.project.projectName,
    employer: proposal.project.employer,
    city: proposal.project.city,
    status: proposal.proposalStatus === "sent" ? "sent" : "draft",
    createdAt: proposal.createdAt.toISOString(),
  }));
};

export default async function ProposalsPage() {
  const proposals = await fetchProposals();

  const sentCount = proposals.filter((proposal) => proposal.status === "sent").length;

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      <section className="rounded-3xl border border-border/40 bg-surface-elevated/40 p-6 shadow-lg shadow-black/30">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border/30 bg-surface p-4">
            <div className="text-sm text-muted">تعداد کل پروپوزال‌ها</div>
            <div className="mt-2 text-2xl font-semibold text-foreground">
              {proposals.length.toLocaleString("fa-IR")}
            </div>
          </div>
          <div className="rounded-2xl border border-border/30 bg-surface p-4">
            <div className="text-sm text-muted">ارسال شده</div>
            <div className="mt-2 text-2xl font-semibold text-success">
              {sentCount.toLocaleString("fa-IR")}
            </div>
          </div>
          <div className="rounded-2xl border border-border/30 bg-surface p-4">
            <div className="text-sm text-muted">در انتظار ارسال</div>
            <div className="mt-2 text-2xl font-semibold text-warning">
              {(proposals.length - sentCount).toLocaleString("fa-IR")}
            </div>
          </div>
          <div className="rounded-2xl border border-border/30 bg-surface p-4">
            <div className="text-sm text-muted">آخرین بروزرسانی</div>
            <div className="mt-2 text-sm text-foreground">
              {proposals[0]
                ? new Date(proposals[0].createdAt).toLocaleString("fa-IR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                : "بدون داده"}
            </div>
          </div>
        </div>
      </section>

      <ProposalsBoard proposals={proposals} />
    </div>
  );
}
