## پنل وب پلی‌گام

پنل مدیریت پروژه‌های صنعتی پلی‌گام بر پایه **Next.js 16**، **TailwindCSS** و **SQLite (Prisma)**. این سامانه امکان ثبت هم‌زمان پروژه در CRM، ارسال داده به وب‌هوک n8n و تولید خلاصه فنی توسط مغز فنی (OpenAI) را فراهم می‌کند.

### راه‌اندازی سریع

```bash
npm install
cp .env.local.example .env.local   # مقداردهی متغیرهای محیطی
npx prisma db push                 # ساخت/به‌روزرسانی پایگاه داده
npm run dev
```

سپس در مرورگر به آدرس [http://localhost:3000](http://localhost:3000) مراجعه کنید.

### ساختار صفحات

- `/` – فرم ثبت پروژه با واکنش لحظه‌ای وضعیت اتوماسیون‌ها
- `/crm` – CRM پروژه‌ها با امکان جست‌وجو و مشاهده آخرین خروجی فنی
- `/proposals` – لیست پروپوزال‌ها و وضعیت ارسال به n8n / مغز فنی
- `/dashboard` – خلاصه وضعیت پروژه‌ها و آخرین فعالیت‌ها
- `/settings` – مدیریت آدرس وب‌هوک n8n و کلید API مغز فنی

### متغیرهای محیطی

در فایل `.env.local` این مقادیر را تنظیم کنید:

```env
DATABASE_URL="file:./prisma/dev.db"
N8N_WEBHOOK_URL="https://example.n8n.cloud/webhook/poligam"
POLIGAM_AI_KEY="your-poligam-ai-key"
```

- در صورت نبود مقادیر، سیستم از مقدار موجود در پایگاه داده یا متغیرهای محیطی استفاده می‌کند.
- جدول `IntegrationSetting` اولین بار از روی `.env.local` مقداردهی می‌شود.

### جداول پایگاه داده (Prisma / SQLite)

| جدول | توضیحات | ستون‌های مهم |
| --- | --- | --- |
| `Project` | نگهداری اطلاعات پروژه و وضعیت آن | `salesName`, `projectName`, `status`, `createdAt` |
| `Proposal` | ذخیره خلاصه فنی و وضعیت ارسال | `projectId`, `proposalStatus`, `proposalData` (JSON) |
| `IntegrationSetting` | نگهداری تنظیمات n8n و مغز فنی | `n8nWebhookUrl`, `poligamAiKey`, `updatedAt` |

### گردش ثبت پروژه

1. ذخیره اطلاعات در جدول `Project` با وضعیت اولیه «جدید».
2. ارسال JSON کامل پروژه به `N8N_WEBHOOK_URL`.
3. تولید خلاصه فنی توسط OpenAI و ذخیره در `Proposal`.
4. نمایش وضعیت موفقیت/خطا برای هر مرحله در رابط کاربری.

### توسعه و تست

- برای مشاهده لاگ کوئری‌ها در حالت توسعه از `NODE_ENV=development` استفاده می‌شود.
- بسته‌ی `openai` تنها در محیط سرور استفاده شده است؛ در صورت عدم نیاز می‌توان کلید را خالی گذاشت تا فراخوانی انجام نشود.
- جهت تنظیم مجدد پایگاه داده: `rm prisma/dev.db && npx prisma db push`.

### مجوز

این پروژه تحت پروانه MIT منتشر شده است. متن کامل در فایل `LICENSE` موجود است.
