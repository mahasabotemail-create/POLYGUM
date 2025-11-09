import prisma from '@/lib/prisma';

type IntegrationSettingsResult = {
  n8nWebhookUrl: string;
  poligamAiKey: string;
};

const SETTINGS_ID = 1;

function envDefaults(): IntegrationSettingsResult {
  return {
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL ?? '',
    poligamAiKey: process.env.POLIGAM_AI_KEY ?? '',
  };
}

export async function getIntegrationSettings(): Promise<IntegrationSettingsResult> {
  const defaults = envDefaults();
  const settings = await prisma.integrationSetting.findUnique({
    where: { id: SETTINGS_ID },
  });

  if (!settings) {
    if (!defaults.n8nWebhookUrl && !defaults.poligamAiKey) {
      return defaults;
    }

    const created = await prisma.integrationSetting.create({
      data: {
        id: SETTINGS_ID,
        n8nWebhookUrl: defaults.n8nWebhookUrl || null,
        poligamAiKey: defaults.poligamAiKey || null,
      },
    });

    return {
      n8nWebhookUrl: created.n8nWebhookUrl ?? '',
      poligamAiKey: created.poligamAiKey ?? '',
    };
  }

  return {
    n8nWebhookUrl: settings.n8nWebhookUrl ?? defaults.n8nWebhookUrl,
    poligamAiKey: settings.poligamAiKey ?? defaults.poligamAiKey,
  };
}

export async function updateIntegrationSettings(data: Partial<IntegrationSettingsResult>) {
  const defaults = envDefaults();

  const updated = await prisma.integrationSetting.upsert({
    where: { id: SETTINGS_ID },
    update: {
      n8nWebhookUrl: data.n8nWebhookUrl?.trim()
        ? data.n8nWebhookUrl.trim()
        : defaults.n8nWebhookUrl || null,
      poligamAiKey: data.poligamAiKey?.trim()
        ? data.poligamAiKey.trim()
        : defaults.poligamAiKey || null,
    },
    create: {
      id: SETTINGS_ID,
      n8nWebhookUrl: data.n8nWebhookUrl?.trim()
        ? data.n8nWebhookUrl.trim()
        : defaults.n8nWebhookUrl || null,
      poligamAiKey: data.poligamAiKey?.trim()
        ? data.poligamAiKey.trim()
        : defaults.poligamAiKey || null,
    },
  });

  return {
    n8nWebhookUrl: updated.n8nWebhookUrl ?? '',
    poligamAiKey: updated.poligamAiKey ?? '',
  };
}
