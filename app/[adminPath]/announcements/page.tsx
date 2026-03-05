import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AnnouncementEditor } from "@/components/admin/AnnouncementEditor";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage({ params }: { params: Promise<{ adminPath: string }> }) {
  const { adminPath } = await params;
  if (adminPath !== process.env.ADMIN_BASE_PATH) notFound();

  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <AdminSidebar basePath={adminPath} />
      <section className="grid gap-4 content-start">
        <div>
          <h1 className="text-3xl font-black text-amber-300">Announcements</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Create and manage public-facing announcements</p>
        </div>
        <AnnouncementEditor basePath={adminPath} initial={announcements} />
      </section>
    </main>
  );
}
