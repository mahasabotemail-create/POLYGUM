import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIntegrationSetting } from "@/lib/settings";

type ProjectPayload = {
  sales_name: string;
  sales_phone: string;
  project_name: string;
  employer: string;
  city: string;
  total_area?: string | number | null;
  substrate_type: string;
  visit_date_sh?: string | null;
};

const REQUIRED_FIELDS: Array<keyof ProjectPayload> = [
  "sales_name",
  "sales_phone",
  "project_name",
  "employer",
  "city",
  "substrate_type",
];

const sanitizeNumber = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numeric = Number(
    String(value)
      .replace(/[^\d.,]/g, "")
      .replace(",", "."),
  );

  return Number.isFinite(numeric) ? numeric : null;
};

const buildTechnicalSummary = (payload: ProjectPayload) => {
  return [
    `نام پروژه: ${payload.project_name}`,
    `کارفرما: ${payload.employer}`,
    `شهر: ${payload.city}`,
    `مساحت کل: ${payload.total_area ?? "نامشخص"} متر مربع`,
    `نوع بستر: ${payload.substrate_type}`,
    `تاریخ بازدید (شمسی): ${payload.visit_date_sh ?? "ثبت نشده"}`,
    `نام کارشناس فروش: ${payload.sales_name}`,
    `شماره تماس فروش: ${payload.sales_phone}`,
  ].join(" | ");
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProjectPayload;

    const missingFields = REQUIRED_FIELDS.filter(
      (field) => !String(body[field] ?? "").trim(),
    );

    if (missingFields.length) {
      return NextResponse.json(
        {
          success: false,
          message: "لطفاً تمام فیلدهای الزامی را تکمیل کنید.",
          missing: missingFields,
        },
        { status: 400 },
      );
    }

    const project = await prisma.project.create({
      data: {
        salesName: body.sales_name.trim(),
        salesPhone: body.sales_phone.trim(),
        projectName: body.project_name.trim(),
        employer: body.employer.trim(),
        city: body.city.trim(),
        totalArea: sanitizeNumber(body.total_area),
        substrateType: body.substrate_type.trim(),
        visitDateSh: body.visit_date_sh?.trim() || null,
      },
    });

    const payloadForIntegrations = {
      ...body,
      status: project.status,
      created_at: project.createdAt,
      project_id: project.id,
    };

    const integrationResults = {
      crm: {
        success: true,
        message: "پروژه در پایگاه داده ذخیره شد.",
      },
      n8n: {
        success: false,
        message: "وبهوک n8n تنظیم نشده است.",
        response: null as unknown,
      },
      openai: {
        success: false,
        message: "کلید API مغز فنی تنظیم نشده است.",
        response: null as unknown,
      },
    };

    let overallSuccess = true;

    // n8n webhook
    const webhookUrl = await getIntegrationSetting("N8N_WEBHOOK_URL");
    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source: "poligam-panel",
            project: payloadForIntegrations,
          }),
        });

        const rawResponse = await response.text();
        let parsed: unknown = rawResponse;

        try {
          parsed = JSON.parse(rawResponse);
        } catch {
          parsed = rawResponse;
        }

        if (!response.ok) {
          integrationResults.n8n = {
            success: false,
            message: "ارسال داده به n8n با خطا مواجه شد.",
            response: parsed,
          };
          overallSuccess = false;
        } else {
          integrationResults.n8n = {
            success: true,
            message: "داده‌ها با موفقیت به n8n ارسال شدند.",
            response: parsed,
          };
        }
      } catch (error) {
        integrationResults.n8n = {
          success: false,
          message: "اتصال به n8n برقرار نشد.",
          response: error instanceof Error ? error.message : error,
        };
        overallSuccess = false;
      }
    }

    // OpenAI
    const aiKey = await getIntegrationSetting("POLIGAM_AI_KEY");
    if (aiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${aiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "شما مغز فنی شرکت پلی‌گام هستید. داده‌های پروژه را دریافت و تحلیل کنید و آماده‌سازی برای تیم فنی را تایید کنید.",
              },
              {
                role: "user",
                content: buildTechnicalSummary(body),
              },
            ],
            temperature: 0.2,
          }),
        });

        const raw = await response.text();
        let parsed: unknown = raw;

        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = raw;
        }

        if (!response.ok) {
          integrationResults.openai = {
            success: false,
            message: "پاسخ OpenAI موفق نبود.",
            response: parsed,
          };
          overallSuccess = false;
        } else {
          integrationResults.openai = {
            success: true,
            message: "تحلیل فنی به OpenAI ارسال شد.",
            response: parsed,
          };
        }
      } catch (error) {
        integrationResults.openai = {
          success: false,
          message: "خطا در ارتباط با OpenAI.",
          response: error instanceof Error ? error.message : error,
        };
        overallSuccess = false;
      }
    }

    return NextResponse.json({
      success: overallSuccess,
      project,
      integrations: integrationResults,
    });
  } catch (error) {
    console.error("خطا در ثبت پروژه:", error);
    return NextResponse.json(
      {
        success: false,
        message: "ثبت پروژه با خطا مواجه شد.",
      },
      { status: 500 },
    );
  }
}
