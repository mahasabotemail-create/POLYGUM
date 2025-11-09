import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';

import prisma from '@/lib/prisma';
import { getIntegrationSettings } from '@/lib/integration-settings';

export const runtime = 'nodejs';

const projectSchema = z.object({
  salesName: z.string().min(1, 'نام فروش باید وارد شود'),
  salesPhone: z.string().min(5, 'شماره فروش باید کامل باشد'),
  projectName: z.string().min(1, 'نام پروژه الزامی است'),
  employer: z.string().optional(),
  city: z.string().optional(),
  totalArea: z.string().optional(),
  substrateType: z.string().optional(),
  visitDateSh: z.string().optional(),
});

type ProjectInput = z.infer<typeof projectSchema>;

type IntegrationResult = {
  success: boolean;
  message: string;
  status?: number;
  payload?: unknown;
};

function normalizeInput(input: ProjectInput): ProjectInput {
  return {
    salesName: input.salesName.trim(),
    salesPhone: input.salesPhone.trim(),
    projectName: input.projectName.trim(),
    employer: input.employer?.trim() || '',
    city: input.city?.trim() || '',
    totalArea: input.totalArea?.trim() || '',
    substrateType: input.substrateType?.trim() || '',
    visitDateSh: input.visitDateSh?.trim() || '',
  };
}

async function sendToN8N(payload: Record<string, unknown>, url: string): Promise<IntegrationResult> {
  if (!url) {
    return {
      success: false,
      message: 'آدرس وب‌هوک n8n تنظیم نشده است.',
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text();
      return {
        success: false,
        status: response.status,
        message: `وب‌هوک n8n با خطا پاسخ داد: ${response.status}`,
        payload: text,
      };
    }

    const data = await response.json().catch(() => null);
    return {
      success: true,
      status: response.status,
      message: 'داده‌ها با موفقیت به n8n ارسال شد.',
      payload: data,
    };
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'اتصال به n8n زمان‌بر شد.'
        : 'ارسال به n8n با خطا مواجه شد.';

    return {
      success: false,
      message,
      payload: error instanceof Error ? error.message : error,
    };
  }
}

async function sendToOpenAI(
  payload: Record<string, unknown>,
  apiKey: string,
): Promise<IntegrationResult & { proposalSummary?: string }> {
  if (!apiKey) {
    return {
      success: false,
      message: 'کلید API مغز فنی تنظیم نشده است.',
    };
  }

  try {
    const client = new OpenAI({ apiKey });
    const prompt = [
      {
        role: 'system' as const,
        content:
          'شما مغز فنی شرکت پلی‌گام هستید و باید خلاصه‌ای فنی از پروژه‌های کف‌پوش صنعتی ارائه دهید.',
      },
      {
        role: 'user' as const,
        content: `با توجه به اطلاعات پروژه زیر، لطفاً خلاصه‌ای از نیازهای فنی، مواد پیشنهادی و مراحل پیشنهادی اجرا را به زبان فارسی و حداکثر در 6 خط بیان کن:
${JSON.stringify(payload, null, 2)}`,
      },
    ];

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: prompt,
      temperature: 0.2,
      max_tokens: 400,
    });

    const content = response.choices[0]?.message?.content ?? '';

    return {
      success: true,
      message: 'تحلیل فنی با موفقیت دریافت شد.',
      payload: response,
      proposalSummary: content.trim(),
    };
  } catch (error) {
    return {
      success: false,
      message: 'دریافت پاسخ از مغز فنی با خطا مواجه شد.',
      payload: error instanceof Error ? error.message : error,
    };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  const projects = await prisma.project.findMany({
    where: query
      ? {
          OR: [
            { projectName: { contains: query, mode: 'insensitive' } },
            { employer: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
            { salesName: { contains: query, mode: 'insensitive' } },
            { salesPhone: { contains: query, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: {
      proposals: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = projectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'ورودی نامعتبر است',
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const data = normalizeInput(parsed.data);

  const project = await prisma.project.create({
    data: {
      salesName: data.salesName,
      salesPhone: data.salesPhone,
      projectName: data.projectName,
      employer: data.employer || null,
      city: data.city || null,
      totalArea: data.totalArea || null,
      substrateType: data.substrateType || null,
      visitDateSh: data.visitDateSh || null,
    },
  });

  const payload = {
    ...project,
    status: project.status ?? 'جدید',
  };

  const settings = await getIntegrationSettings();
  const [n8nResult, openAiResult] = await Promise.all([
    sendToN8N(payload, settings.n8nWebhookUrl),
    sendToOpenAI(payload, settings.poligamAiKey),
  ]);

  const proposalData = {
    openAi: {
      success: openAiResult.success,
      message: openAiResult.message,
      summary: openAiResult.proposalSummary,
    },
    n8n: {
      success: n8nResult.success,
      message: n8nResult.message,
      status: n8nResult.status,
    },
  };

  await prisma.proposal.create({
    data: {
      projectId: project.id,
      proposalStatus: openAiResult.success ? 'draft' : 'draft',
      proposalData,
    },
  });

  return NextResponse.json(
    {
      project,
      integrations: {
        n8n: n8nResult,
        openAi: openAiResult,
      },
      message:
        n8nResult.success && openAiResult.success
          ? 'اطلاعات با موفقیت ثبت شد.'
          : 'اطلاعات ذخیره شد اما برخی یکپارچه‌سازی‌ها با خطا مواجه شدند.',
    },
    {
      status: n8nResult.success && openAiResult.success ? 200 : 207,
    },
  );
}
