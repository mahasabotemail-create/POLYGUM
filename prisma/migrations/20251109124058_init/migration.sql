-- CreateTable
CREATE TABLE "projects" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sales_name" TEXT NOT NULL,
    "sales_phone" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "employer" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "total_area" REAL,
    "substrate_type" TEXT NOT NULL,
    "visit_date_sh" TEXT,
    "status" TEXT NOT NULL DEFAULT 'جدید',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "project_id" INTEGER NOT NULL,
    "proposal_status" TEXT NOT NULL DEFAULT 'draft',
    "proposal_data" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "proposals_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");
