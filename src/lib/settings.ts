import { prisma } from "@/lib/prisma";

const INTEGRATION_KEYS = ["N8N_WEBHOOK_URL", "POLIGAM_AI_KEY"] as const;

export type IntegrationKey = (typeof INTEGRATION_KEYS)[number];

type IntegrationSettings = Partial<Record<IntegrationKey, string>>;

const envFallback = (key: IntegrationKey) => process.env[key] ?? "";

export async function getIntegrationSetting(key: IntegrationKey) {
  const setting = await prisma.setting.findUnique({
    where: { key },
  });

  if (setting?.value) {
    return setting.value;
  }

  return envFallback(key);
}

export async function getIntegrationSettings(): Promise<IntegrationSettings> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: INTEGRATION_KEYS as unknown as string[] } },
  });

  const map = new Map<IntegrationKey, string>();

  rows.forEach((row) => {
    if (INTEGRATION_KEYS.includes(row.key as IntegrationKey)) {
      map.set(row.key as IntegrationKey, row.value);
    }
  });

  const settings: IntegrationSettings = {};

  INTEGRATION_KEYS.forEach((integrationKey) => {
    settings[integrationKey] =
      map.get(integrationKey) || envFallback(integrationKey) || "";
  });

  return settings;
}

export async function upsertIntegrationSettings(
  values: IntegrationSettings,
): Promise<IntegrationSettings> {
  const entries = Object.entries(values) as [IntegrationKey, string][];

  const filtered = entries.filter(
    ([key, value]) => INTEGRATION_KEYS.includes(key) && typeof value === "string",
  );

  if (!filtered.length) {
    return getIntegrationSettings();
  }

  await prisma.$transaction(
    filtered.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: value.trim() },
        create: { key, value: value.trim() },
      }),
    ),
  );

  return getIntegrationSettings();
}

export function redactValue(value?: string) {
  if (!value) return "";
  if (value.length <= 8) return "••••";
  return `${value.slice(0, 4)}••••${value.slice(-2)}`;
}
