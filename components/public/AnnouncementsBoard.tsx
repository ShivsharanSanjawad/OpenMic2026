import Link from "next/link";
import { Announcement } from "@prisma/client";

type Props = {
  announcements: Announcement[];
};

export function AnnouncementsBoard({ announcements }: Props) {
  if (!announcements.length) {
    return (
      <div className="card text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <p className="text-sm text-zinc-400">No announcements yet.</p>
        <p className="text-xs text-zinc-600 mt-2">Check back later for important updates!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {announcements.slice(0, 6).map((a, index) => (
          <article 
            key={a.id} 
            className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              a.isPinned 
                ? "border-amber-500/50 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent" 
                : "border-zinc-800/50 bg-gradient-to-br from-zinc-900/30 via-zinc-800/20 to-transparent"
            } backdrop-blur-sm p-5`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {a.isPinned && (
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-1">
                <div className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-xs font-medium text-amber-300">Pinned</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-3">
              <div className={`h-2 w-2 rounded-full ${a.isPinned ? 'bg-amber-400' : 'bg-blue-400'}`} />
              <p className="text-xs uppercase tracking-wider font-medium text-amber-300">{a.type}</p>
            </div>
            
            <h3 className="text-lg font-bold text-white group-hover:text-amber-200 transition-colors duration-300 mb-3 line-clamp-2">
              {a.title}
            </h3>
            
            <p className="text-sm text-zinc-300 line-clamp-3 leading-relaxed mb-4">{a.body}</p>
            
            <div className="flex justify-between items-center text-xs text-zinc-500">
              <time>{new Date(a.createdAt).toLocaleDateString()}</time>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      {announcements.length > 6 && (
        <div className="text-center">
          <Link 
            href="/announcements" 
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 px-6 py-3 text-sm font-semibold text-amber-300 transition-all duration-300 hover:from-amber-500/30 hover:to-amber-600/30 hover:border-amber-400/50 hover:scale-105 backdrop-blur-sm"
          >
            <span>View All Announcements</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
