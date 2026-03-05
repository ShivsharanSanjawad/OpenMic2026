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
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-6 py-8 md:grid-cols-[220px_1fr]">
      <AdminSidebar basePath={adminPath} />
      <section className="grid gap-4">
        <h1 className="text-3xl font-black text-amber-300">Announcement Manager</h1>
        <AnnouncementEditor basePath={adminPath} initial={announcements} />
      </section>
    </main>
  );
}
