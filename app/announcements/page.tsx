import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    where: { isPublished: true },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <main className="min-h-screen bg-[#020617]">
      <div className="mx-auto max-w-2xl px-5 py-14 sm:px-6 sm:py-24">
        {/* Header */}
        <div className="text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/70 sm:text-[11px] sm:tracking-[0.35em]">
            Stay in the loop
          </p>
          <h1 className="mt-3 font-heading text-4xl tracking-wide text-white sm:text-6xl">
            Announcements
          </h1>
        </div>

        {/* Cards */}
        <div className="mt-10 space-y-4 sm:mt-14">
          {announcements.length === 0 && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-14 text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-600">
                No announcements yet
              </p>
              <p className="mt-1.5 text-xs text-zinc-700">Check back later for updates.</p>
            </div>
          )}

          {announcements.map((item) => (
            <article
              key={item.id}
              className={`relative rounded-2xl border p-5 sm:p-6 ${
                item.isPinned
                  ? "border-amber-400/15 bg-amber-400/[0.03]"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-3 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-400/80">
                  {item.type}
                </span>
                {item.isPinned && (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400/50">
                    Pinned
                  </span>
                )}
              </div>

              <h2 className="mt-3 text-lg font-semibold leading-snug text-white sm:text-xl">
                {item.title}
              </h2>

              {item.body && (
                <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-zinc-500">
                  {item.body}
                </p>
              )}

              <time className="mt-4 block font-mono text-[10px] tracking-wider text-zinc-700">
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </article>
          ))}
        </div>

        {/* Back link */}
        <div className="mt-10 text-center sm:mt-14">
          <Link
            href="/"
            className="inline-block font-mono text-[11px] uppercase tracking-widest text-zinc-600 transition-colors hover:text-amber-400"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
