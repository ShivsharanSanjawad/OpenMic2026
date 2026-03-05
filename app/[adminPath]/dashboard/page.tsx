import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ params }: { params: Promise<{ adminPath: string }> }) {
  const { adminPath } = await params;
  if (adminPath !== process.env.ADMIN_BASE_PATH) notFound();

  const [total, pendingReview, pendingCorrection, verified, rejected, todayCount, recent] = await Promise.all([
    prisma.registration.count(),
    prisma.registration.count({ where: { paymentStatus: "PENDING_REVIEW" } }),
    prisma.registration.count({ where: { paymentStatus: "PENDING_CORRECTION" } }),
    prisma.registration.count({ where: { paymentStatus: "VERIFIED" } }),
    prisma.registration.count({ where: { paymentStatus: "REJECTED" } }),
    prisma.registration.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.registration.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-6 py-8 md:grid-cols-[220px_1fr]">
      <AdminSidebar basePath={adminPath} />
      <section className="grid gap-6">
        <h1 className="text-3xl font-black text-amber-300">Dashboard</h1>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <Card label="Total" value={total} />
          <Card label="Pending Review" value={pendingReview} />
          <Card label="Needs Correction" value={pendingCorrection} />
          <Card label="Verified" value={verified} />
          <Card label="Rejected" value={rejected} />
          <Card label="Today" value={todayCount} />
        </div>
        <div className="rounded-xl border border-zinc-800 p-4">
          <h2 className="text-lg font-semibold">Recent Registrations</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded bg-zinc-900 px-3 py-2">
                <span>{r.name}</span>
                <span className="text-zinc-400">{r.paymentStatus}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
