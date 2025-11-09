import ProjectForm from "@/components/projects/project-form";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      <ProjectForm />
      <section className="rounded-3xl border border-border/40 bg-surface-elevated/40 p-6 shadow-lg shadow-black/20">
        <h2 className="text-lg font-semibold text-foreground">
          راهنمای ثبت اطلاعات
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-muted leading-6">
          <li>• فیلدهای ستاره‌دار الزامی هستند و بدون آنها ثبت انجام نمی‌شود.</li>
          <li>
            • پس از ذخیره موفق، وضعیت هر سرویس (CRM، n8n، مغز فنی) در پایین فرم
            نمایش داده می‌شود.
          </li>
          <li>
            • برای فعال شدن ارسال به n8n و مغز فنی، ابتدا مقادیر بخش تنظیمات را
            تکمیل کنید.
          </li>
        </ul>
      </section>
    </div>
  );
}
