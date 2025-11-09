import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getIntegrationSettings, updateIntegrationSettings } from '@/lib/integration-settings';

export const runtime = 'nodejs';

const settingsSchema = z.object({
  n8nWebhookUrl: z
    .string()
    .trim()
    .url('آدرس وب‌هوک باید معتبر باشد')
    .or(z.literal(''))
    .optional(),
  poligamAiKey: z.string().trim().min(8, 'کلید API حداقل باید ۸ کاراکتر باشد').or(z.literal('')).optional(),
});

export async function GET() {
  const settings = await getIntegrationSettings();

  return NextResponse.json({
    settings,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'ورودی نامعتبر است',
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const updated = await updateIntegrationSettings(parsed.data);

  return NextResponse.json({
    settings: updated,
    message: 'تنظیمات با موفقیت ذخیره شد.',
  });
}
