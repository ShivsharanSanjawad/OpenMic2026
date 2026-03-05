import { prisma } from "@/lib/prisma";
import { AnnouncementType } from "@prisma/client";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const where = {
    isPublished: true,
    ...(type && type !== "ALL" ? { type: type as AnnouncementType } : {}),
  };

  const announcements = await prisma.announcement.findMany({
    where,
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <h1 className="text-4xl font-black text-amber-300">Announcements</h1>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {[
          ["ALL", "All"],
          ["SHORTLIST", "Shortlist"],
          ["SCHEDULE", "Schedule"],
          ["RESULT", "Results"],
          ["IMPORTANT", "Important"],
        ].map(([value, label]) => (
          <a
            key={value}
            href={`/announcements?type=${value}`}
            className="rounded-full border border-zinc-700 px-3 py-1 hover:border-amber-400"
          >
            {label}
          </a>
        ))}
      </div>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {announcements.map((item) => (
          <article key={item.id} className={`rounded-xl border p-4 ${item.isPinned ? "border-amber-500" : "border-zinc-800"}`}>
            <p className="text-xs uppercase text-amber-300">{item.type}</p>
            <h2 className="mt-2 text-xl font-semibold">{item.title}</h2>
            <p className="mt-2 whitespace-pre-wrap text-zinc-300">{item.body}</p>
            <p className="mt-3 text-xs text-zinc-500">{new Date(item.createdAt).toLocaleString()}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
