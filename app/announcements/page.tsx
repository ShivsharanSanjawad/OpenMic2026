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
    <main className="min-h-screen bg-[#020617]">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-20">
        {/* Header */}
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/70 sm:text-[11px] sm:tracking-[0.35em]">Stay in the loop</p>
        <h1 className="mt-3 font-heading text-4xl tracking-wide text-white sm:text-6xl md:text-7xl">Announcements</h1>

        {/* Filter pills */}
        <div className="mt-5 flex flex-wrap gap-2 sm:mt-8">
          {[
            ["ALL", "All"],
            ["SHORTLIST", "Shortlist"],
            ["SCHEDULE", "Schedule"],
            ["RESULT", "Results"],
            ["IMPORTANT", "Important"],
          ].map(([value, label]) => {
            const isActive = (type ?? "ALL") === value;
            return (
              <a
                key={value}
                href={`/announcements?type=${value}`}
                className={`rounded-full border px-5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${
                  isActive
                    ? "border-amber-400/40 bg-amber-400/10 text-amber-400"
                    : "border-white/[0.06] text-zinc-500 hover:border-amber-400/20 hover:text-amber-400/70"
                }`}
              >
                {label}
              </a>
            );
          })}
        </div>

        {/* Announcements grid */}
        <section className="mt-8 grid gap-4 sm:mt-12 md:grid-cols-2">
          {announcements.length === 0 && (
            <div className="col-span-full rounded-2xl border border-white/5 bg-white/[0.02] p-16 text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-600">No announcements found</p>
            </div>
          )}
          {announcements.map((item, index) => (
            <article
              key={item.id}
              className={`group relative overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-900/10 sm:p-6 ${
                item.isPinned
                  ? "border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] via-transparent to-transparent"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* top accent line */}
              <div className={`absolute inset-x-0 top-0 h-px ${item.isPinned ? "bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" : "bg-gradient-to-r from-transparent via-white/10 to-transparent"}`} />

              {item.isPinned && (
                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400/80">Pinned</span>
                </div>
              )}

              <div className="mb-3 flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${item.isPinned ? "bg-amber-400" : "bg-zinc-600"}`} />
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400/60">{item.type}</p>
              </div>

              <h2 className="text-lg font-semibold leading-snug text-white/90 transition-colors duration-300 group-hover:text-amber-400 sm:text-xl">
                {item.title}
              </h2>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-500">{item.body}</p>

              <time className="mt-5 block font-mono text-[10px] tracking-wider text-zinc-700">
                {new Date(item.createdAt).toLocaleString()}
              </time>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
