import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const projectId = searchParams.get('projectId');

  const proposals = await prisma.proposal.findMany({
    where: {
      proposalStatus: status ?? undefined,
      projectId: projectId ? Number(projectId) : undefined,
    },
    include: {
      project: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ proposals });
}
