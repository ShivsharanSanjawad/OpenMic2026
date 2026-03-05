import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { RegistrationsTable } from "@/components/admin/RegistrationsTable";
import { ExportButtons } from "@/components/admin/ExportButtons";

export const dynamic = "force-dynamic";

export default async function RegistrationsPage({ params }: { params: Promise<{ adminPath: string }> }) {
  const { adminPath } = await params;
  if (adminPath !== process.env.ADMIN_BASE_PATH) notFound();

  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    include: { adminComments: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-6 py-8 md:grid-cols-[220px_1fr]">
      <AdminSidebar basePath={adminPath} />
      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-amber-300">Registrations</h1>
          <ExportButtons basePath={adminPath} />
        </div>
        <RegistrationsTable
          basePath={adminPath}
          rows={registrations.map((r) => ({
            ...r,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
            teamMembers: Array.isArray(r.teamMembers) ? (r.teamMembers as string[]) : null,
            adminComments: r.adminComments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
          }))}
        />
      </section>
    </main>
  );
}
