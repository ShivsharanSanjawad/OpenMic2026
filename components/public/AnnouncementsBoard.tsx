import Link from "next/link";
import { Announcement } from "@prisma/client";

type Props = {
  announcements: Announcement[];
};

export function AnnouncementsBoard({ announcements }: Props) {
  if (!(announcements ?? []).length) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-600">No announcements yet</p>
        <p className="mt-1.5 text-xs text-zinc-700">Check back later for updates.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {(announcements ?? []).slice(0, 4).map((a) => (
        <article
          key={a.id}
          className={`relative rounded-2xl border p-5 sm:p-6 ${
            a.isPinned
              ? "border-amber-400/15 bg-amber-400/[0.03]"
              : "border-white/[0.06] bg-white/[0.02]"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-3 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-400/80">
              {a.type}
            </span>
            {a.isPinned && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400/50">
                Pinned
              </span>
            )}
          </div>

          <h3 className="mt-3 text-lg font-semibold leading-snug text-white">
            {a.title}
          </h3>

          {a.body && (
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 line-clamp-2">{a.body}</p>
          )}

          <time className="mt-4 block font-mono text-[10px] tracking-wider text-zinc-700">
            {new Date(a.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        </article>
      ))}

      <div className="pt-2 text-center">
        <Link
          href="/announcements"
          className="inline-block font-mono text-[11px] uppercase tracking-widest text-zinc-600 transition-colors hover:text-amber-400"
        >
          View All Announcements &rarr;
        </Link>
      </div>
    </div>
  );
}
