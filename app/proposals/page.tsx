import prisma from '@/lib/prisma';
import ProposalsView from '@/components/proposals/proposals-view';

export const dynamic = 'force-dynamic';

export default async function ProposalsPage() {
  const proposals = await prisma.proposal.findMany({
    include: {
      project: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return <ProposalsView initialProposals={proposals} />;
}
