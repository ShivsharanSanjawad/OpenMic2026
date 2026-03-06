import Link from "next/link";
import MicHero from "@/components/public/MicHero";
import { AnnouncementsBoard } from "@/components/public/AnnouncementsBoard";
import { prisma } from "@/lib/prisma";
import { getPublicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, latestAnnouncements] = await Promise.all([
    getPublicSettings(),
    prisma.announcement.findMany({
      where: { isPublished: true },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
  ]);

  return (
    <main className="bg-[#020617]">
      <MicHero />

      {/* ── About SPARK ── */}
      <section className="relative mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-24">
        {/* subtle top divider glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/70 sm:text-[11px] sm:tracking-[0.35em]">Who we are</p>
        <h2 className="mt-3 font-heading text-4xl tracking-wide text-white sm:text-5xl md:text-6xl">About SPARK</h2>

        <div className="mt-6 grid gap-6 sm:mt-10 sm:gap-10 md:grid-cols-2">
          <div className="space-y-4 sm:space-y-5">
            <p className="text-base leading-relaxed text-zinc-300/90 sm:text-lg">
              <span className="font-semibold text-amber-400">SPARK</span> is the cultural committee of{" "}
              <span className="font-semibold text-white">Sardar Patel Institute of Technology (SPIT), Mumbai</span>.
              We exist to ignite creative expression across campus — through art, music, theatre, and the spoken word.
            </p>
            <p className="text-sm leading-relaxed text-zinc-500 sm:text-[15px]">
              Every year we host a range of cultural events that push students to discover their talents, build
              confidence, and own the stage. OpenMic is our flagship event and a SPIT tradition.
            </p>
          </div>
          <div className="space-y-4 sm:space-y-5">
            <p className="text-base leading-relaxed text-zinc-300/90 sm:text-lg">
              <span className="font-semibold text-amber-400">SPARK OpenMic</span> — now in its{" "}
              <span className="font-semibold text-white">10th Edition</span> — is an open platform for poetry,
              spoken word, music, stand-up comedy, storytelling, and any form of vocal performance.
              No filters. No limits. Just your voice and the mic.
            </p>
            <p className="text-sm leading-relaxed text-zinc-500 sm:text-[15px]">
              {settings.event_date && settings.event_venue
                ? `Happening on ${settings.event_date} at ${settings.event_venue}.`
                : "Date and venue to be announced."}
              {" "}Register now and step into the spotlight.
            </p>
          </div>
        </div>
      </section>

      {/* ── Performer Registration ── */}
      <section className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/20 via-[#0a0e1a] to-[#020617] p-6 sm:p-10">
          {/* inner glow band */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

          <h2 className="font-heading text-3xl tracking-wide text-amber-400 sm:text-5xl">Want to perform?</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:mt-4 sm:text-[15px]">
            Register now to perform at SPARK OpenMic. This registration is <span className="font-semibold text-amber-400">for performers only</span>.
            Audience members do <span className="font-semibold text-white">not</span> need to register.
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-500 sm:text-[15px]">
            You can perform <span className="font-semibold text-white">only after your payment is VERIFIED</span>. Your Registration ID will be sent to your email after submission.
          </p>
          <div className="mt-6 sm:mt-8">
            <Link href="/register" className="inline-block rounded-full bg-amber-400 px-8 py-3 font-mono text-[11px] uppercase tracking-widest text-slate-900 shadow-lg shadow-amber-400/20 transition-all duration-300 hover:scale-105 hover:bg-amber-300 active:scale-95 sm:px-10 sm:py-3.5 sm:text-sm">
              Register Now to Perform →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Latest Announcements ── */}
      <section className="relative mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/70 sm:text-[11px] sm:tracking-[0.35em]">Stay in the loop</p>
        <h2 className="mt-3 font-heading text-4xl tracking-wide text-white sm:text-5xl md:text-6xl">Announcements</h2>
        <div className="mt-6 sm:mt-10">
          <AnnouncementsBoard announcements={latestAnnouncements} />
        </div>
        <Link href="/announcements" className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-400/70 transition-colors hover:text-amber-400 sm:mt-8 sm:text-sm">
          View all announcements
          <span aria-hidden>→</span>
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 bg-[#020617] px-5 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 text-center text-sm text-zinc-600 sm:flex-row sm:justify-between sm:text-left">
          <p className="font-mono text-[10px] tracking-wider sm:text-xs">© SPARK OpenMic 10th Edition · SPIT Mumbai</p>
          <p>
            Contact:{" "}
            <a href="mailto:spark@spit.ac.in" className="text-amber-400/70 transition-colors hover:text-amber-400">
              spark@spit.ac.in
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}

