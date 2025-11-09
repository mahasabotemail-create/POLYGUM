-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "salesName" TEXT NOT NULL,
    "salesPhone" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "employer" TEXT,
    "city" TEXT,
    "totalArea" TEXT,
    "substrateType" TEXT,
    "visitDateSh" TEXT,
    "status" TEXT NOT NULL DEFAULT 'جدید',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "proposalStatus" TEXT NOT NULL DEFAULT 'draft',
    "proposalData" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Proposal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntegrationSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "n8nWebhookUrl" TEXT,
    "poligamAiKey" TEXT,
    "updatedAt" DATETIME NOT NULL
);
