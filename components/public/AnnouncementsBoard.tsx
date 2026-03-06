import Link from "next/link";
import { Announcement } from "@prisma/client";

type Props = {
  announcements: Announcement[];
};

export function AnnouncementsBoard({ announcements }: Props) {
  if (!(announcements ?? []).length) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-10 text-center backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/5 bg-white/[0.03]">
          <svg className="h-6 w-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">No announcements yet</p>
        <p className="mt-1 text-xs text-zinc-700">Check back later for important updates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(announcements ?? []).slice(0, 6).map((a, index) => (
          <article
            key={a.id}
            className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-900/10 ${
              a.isPinned
                ? "border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] via-transparent to-transparent"
                : "border-white/[0.06] bg-white/[0.02]"
            } backdrop-blur-sm p-6`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* top accent line */}
            <div className={`absolute inset-x-0 top-0 h-px ${a.isPinned ? "bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" : "bg-gradient-to-r from-transparent via-white/10 to-transparent"}`} />

            {a.isPinned && (
              <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400/80">Pinned</span>
              </div>
            )}

            <div className="mb-3 flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${a.isPinned ? "bg-amber-400" : "bg-zinc-600"}`} />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400/60">{a.type}</p>
            </div>

            <h3 className="text-lg font-semibold leading-snug text-white/90 transition-colors duration-300 group-hover:text-amber-400 line-clamp-2">
              {a.title}
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-zinc-500 line-clamp-3">{a.body}</p>

            <div className="mt-5 flex items-center justify-between">
              <time className="font-mono text-[10px] tracking-wider text-zinc-600">{new Date(a.createdAt).toLocaleDateString()}</time>
              <svg className="h-4 w-4 text-amber-400/0 transition-all duration-300 group-hover:text-amber-400/60 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </article>
        ))}
      </div>

      {(announcements ?? []).length > 6 && (
        <div className="text-center">
          <Link
            href="/announcements"
            className="inline-flex items-center gap-2 rounded-full border border-amber-400/15 bg-amber-400/[0.05] px-8 py-3 font-mono text-xs uppercase tracking-widest text-amber-400/70 backdrop-blur-sm transition-all duration-300 hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-400"
          >
            <span>View All Announcements</span>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
