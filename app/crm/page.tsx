import prisma from '@/lib/prisma';
import CRMView from '@/components/crm/crm-view';

export const dynamic = 'force-dynamic';

export default async function CRMPage() {
  const projects = await prisma.project.findMany({
    include: {
      proposals: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return <CRMView initialProjects={projects} />;
}
