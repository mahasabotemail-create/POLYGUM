'use client';

import { useMemo, useState } from "react";

type ProposalSummary = {
  id: number;
  proposalStatus: string;
  createdAt: string;
};

export type CRMProject = {
  id: number;
  salesName: string;
  salesPhone: string;
  projectName: string;
  employer: string;
  city: string;
  totalArea: number | null;
  substrateType: string;
  visitDateSh: string | null;
  status: string;
  createdAt: string;
  proposals: ProposalSummary[];
};

const statusColors: Record<string, string> = {
  جدید: "bg-accent/20 text-accent",
  "در حال بررسی": "bg-warning/20 text-warning",
  برنده: "bg-success/20 text-success",
  لغو: "bg-danger/20 text-danger",
};

export default function ProjectsTable({ projects }: { projects: CRMProject[] }) {
  const [term, setTerm] = useState("");

  const filtered = useMemo(() => {
    const trimmed = term.trim();
    if (!trimmed) return projects;

    return projects.filter((project) => {
      const haystack = [
        project.projectName,
        project.employer,
        project.city,
        project.salesName,
        project.salesPhone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(trimmed.toLowerCase());
    });
  }, [projects, term]);

  return (
    <section className="flex w-full flex-col gap-4 rounded-3xl border border-border/40 bg-surface p-6 shadow-lg shadow-black/20">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">لیست پروژه‌ها</h2>
          <p className="text-sm text-muted">
            جستجو بر اساس نام پروژه، کارفرما، شهر یا کارشناس فروش.
          </p>
        </div>
        <input
          type="search"
          placeholder="جستجو..."
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          className="w-full rounded-full border border-border/50 bg-surface-muted/60 px-4 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 md:w-64"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border/40 text-sm">
          <thead>
            <tr className="text-muted">
              <th className="whitespace-nowrap px-3 py-2 text-right font-medium">
                پروژه
              </th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-medium">
                کارفرما
              </th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-medium">
                شهر
              </th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-medium">
                کارشناس فروش
              </th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-medium">
                وضعیت
              </th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-medium">
                پروپوزال‌ها
              </th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-medium">
                تاریخ ثبت
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {filtered.map((project) => (
              <tr key={project.id} className="text-foreground/90">
                <td className="whitespace-nowrap px-3 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{project.projectName}</span>
                    <span className="text-xs text-muted">
                      {project.totalArea
                        ? `${project.totalArea.toLocaleString("fa-IR")} متر`
                        : "مساحت ثبت نشده"}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3">{project.employer}</td>
                <td className="whitespace-nowrap px-3 py-3">{project.city}</td>
                <td className="whitespace-nowrap px-3 py-3">
                  <div className="flex flex-col">
                    <span>{project.salesName}</span>
                    <span className="text-xs text-muted">
                      {project.salesPhone}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <span
                    className={[
                      "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold",
                      statusColors[project.status] ??
                        "bg-surface-muted/80 text-muted",
                    ].join(" ")}
                  >
                    {project.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {project.proposals.length ? (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {project.proposals.map((proposal) => (
                        <span
                          key={proposal.id}
                          className="rounded-full border border-border/40 bg-surface-muted/60 px-3 py-1 text-muted"
                        >
                          {proposal.proposalStatus === "sent"
                            ? "ارسال شد"
                            : "پیش‌نویس"}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted">بدون پروپوزال</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-xs text-muted">
                  {new Date(project.createdAt).toLocaleString("fa-IR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-sm text-muted"
                >
                  نتیجه‌ای پیدا نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
