import { NextResponse } from "next/server";
import {
  getIntegrationSettings,
  upsertIntegrationSettings,
} from "@/lib/settings";

export async function GET() {
  const settings = await getIntegrationSettings();

  return NextResponse.json({ settings });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, string>;
    const updated = await upsertIntegrationSettings(payload);

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("خطا در ذخیره تنظیمات", error);
    return NextResponse.json(
      {
        success: false,
        message: "ذخیره تنظیمات با مشکل مواجه شد.",
      },
      { status: 500 },
    );
  }
}
