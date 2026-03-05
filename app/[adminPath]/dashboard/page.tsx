import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING_REVIEW: { bg: "bg-yellow-500/15 border-yellow-500/30", text: "text-yellow-300", dot: "bg-yellow-400" },
  PENDING_CORRECTION: { bg: "bg-orange-500/15 border-orange-500/30", text: "text-orange-300", dot: "bg-orange-400" },
  VERIFIED: { bg: "bg-green-500/15 border-green-500/30", text: "text-green-300", dot: "bg-green-400" },
  REJECTED: { bg: "bg-red-500/15 border-red-500/30", text: "text-red-300", dot: "bg-red-400" },
};

export default async function DashboardPage({ params }: { params: Promise<{ adminPath: string }> }) {
  const { adminPath } = await params;
  if (adminPath !== process.env.ADMIN_BASE_PATH) notFound();

  const [total, pendingReview, pendingCorrection, verified, rejected, todayCount, recent, regOpen] = await Promise.all([
    prisma.registration.count(),
    prisma.registration.count({ where: { paymentStatus: "PENDING_REVIEW" } }),
    prisma.registration.count({ where: { paymentStatus: "PENDING_CORRECTION" } }),
    prisma.registration.count({ where: { paymentStatus: "VERIFIED" } }),
    prisma.registration.count({ where: { paymentStatus: "REJECTED" } }),
    prisma.registration.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.registration.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    getSetting("registrations_open"),
  ]);

  const isOpen = regOpen === "true";

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <AdminSidebar basePath={adminPath} />
      <section className="grid gap-6 content-start">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-amber-300">Dashboard</h1>
            <p className="text-sm text-zinc-400 mt-0.5">SPARK OpenMic 10 — Admin Overview</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${isOpen ? "bg-green-500/15 text-green-300 border border-green-500/30" : "bg-red-500/15 text-red-300 border border-red-500/30"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
            Registrations {isOpen ? "Open" : "Closed"}
          </span>
        </div>

        {/* Stat cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total Registrations" value={total}
            color="from-amber-500/20 to-orange-500/10 border-amber-500/30"
            textColor="text-amber-300" numColor="text-amber-200"
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}
          />
          <StatCard label="Pending Review" value={pendingReview}
            color="from-yellow-500/20 to-yellow-500/10 border-yellow-500/30"
            textColor="text-yellow-300" numColor="text-yellow-200"
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
          />
          <StatCard label="Needs Correction" value={pendingCorrection}
            color="from-orange-500/20 to-orange-500/10 border-orange-500/30"
            textColor="text-orange-300" numColor="text-orange-200"
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />}
          />
          <StatCard label="Verified" value={verified}
            color="from-green-500/20 to-emerald-500/10 border-green-500/30"
            textColor="text-green-300" numColor="text-green-200"
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
          />
          <StatCard label="Rejected" value={rejected}
            color="from-red-500/20 to-red-500/10 border-red-500/30"
            textColor="text-red-300" numColor="text-red-200"
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />}
          />
          <StatCard label="Registered Today" value={todayCount}
            color="from-sky-500/20 to-blue-500/10 border-sky-500/30"
            textColor="text-sky-300" numColor="text-sky-200"
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
          />
        </div>

        {/* Recent registrations */}
        <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
            <h2 className="font-semibold text-zinc-100">Recent Registrations</h2>
            <span className="text-xs text-zinc-500">Latest 10</span>
          </div>
          <ul className="divide-y divide-zinc-800">
            {recent.map((r) => {
              const s = STATUS_STYLES[r.paymentStatus] ?? { bg: "bg-zinc-800/50 border-zinc-700", text: "text-zinc-400", dot: "bg-zinc-500" };
              return (
                <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-zinc-800/30 transition-colors">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-100">{r.name}</p>
                    <p className="truncate text-xs text-zinc-500">{r.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-zinc-500">{r.performanceType}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
                      <span className={`h-1 w-1 rounded-full ${s.dot}`} />
                      {r.paymentStatus.replace("_", " ")}
                    </span>
                  </div>
                </li>
              );
            })}
            {recent.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-zinc-500">No registrations yet</li>
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label, value, color, textColor, numColor, icon,
}: {
  label: string; value: number; color: string; textColor: string; numColor: string; icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${color}`}>
      <div className="flex items-start justify-between">
        <p className={`text-sm font-medium ${textColor}`}>{label}</p>
        <div className={`rounded-lg p-1.5 bg-white/5`}>
          <svg className={`h-4 w-4 ${textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {icon}
          </svg>
        </div>
      </div>
      <p className={`mt-3 text-4xl font-black tracking-tight ${numColor}`}>{value}</p>
    </div>
  );
}
