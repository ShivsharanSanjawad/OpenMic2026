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

      {/* ── Promo Video ── */}
      <section className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

        {/* Two-column: text + video — stacks on mobile (video first) */}
        <div className="flex flex-col items-center gap-10 lg:flex-row-reverse lg:items-center lg:gap-16 xl:gap-20">

          {/* ── Video column ── */}
          <div className="w-full max-w-[340px] shrink-0 sm:max-w-[360px] lg:max-w-[380px]">
            <div
              className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-black/40"
              style={{ aspectRatio: "9 / 16" }}
            >
              {/* Ambient glow */}
              <div
                className="pointer-events-none absolute -inset-3 rounded-[2rem]"
                style={{
                  boxShadow:
                    "0 0 80px rgba(245,158,11,0.10), 0 0 160px rgba(245,158,11,0.05)",
                }}
              />

              <iframe
                src="https://www.youtube.com/embed/gKMeOf2Xkpk?autoplay=1&mute=1&loop=1&playlist=gKMeOf2Xkpk&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1"
                title="SPARK OpenMic Promo"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="absolute inset-0 h-full w-full rounded-3xl"
                style={{ border: "none" }}
              />
            </div>
          </div>

          {/* ── Text column ── */}
          <div className="flex flex-col items-center text-center">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/70 sm:text-[11px] sm:tracking-[0.35em]">
              Feel the energy
            </p>

            <h2 className="mt-3 font-heading text-4xl tracking-wide text-white sm:text-5xl lg:text-6xl">
              Step Into the<br />Spotlight
            </h2>

            <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-400 sm:mt-5 sm:text-lg">
              SPARK OpenMic is where raw talent meets an electrifying audience.
              No scripts. No filters. Just you, the mic, and a room full of energy.
              Whether you write verses, strum chords, or crack jokes — the stage is yours.
            </p>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap justify-center gap-2 sm:mt-8">
              {["Poetry", "Music", "Stand-up", "Spoken Word", "Storytelling"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-amber-300/80 sm:text-[11px]"
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>

            <Link
              href="/register"
              className="mt-8 inline-block rounded-full bg-amber-400 px-8 py-3 font-mono text-[11px] uppercase tracking-widest text-slate-900 shadow-lg shadow-amber-400/20 transition-all duration-300 hover:scale-105 hover:bg-amber-300 active:scale-95 sm:mt-10 sm:px-10 sm:py-3.5 sm:text-sm"
            >
              Register to Perform →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 10 Years of OpenMic ── */}
      <section className="relative mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-28">
        {/* Gold divider — top */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

        <div className="text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/70 sm:text-[11px] sm:tracking-[0.35em]">
            A decade on stage
          </p>
          <h2 className="mt-3 font-heading text-5xl tracking-wide text-white sm:text-6xl md:text-7xl">
            10 Years of OpenMic
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-zinc-400 sm:mt-5 sm:text-lg">
            A decade of voices, stories, and performances that lit up the stage.
            From a small room to a packed auditorium — this is where it all started.
          </p>
        </div>

        {/* Stats row */}
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:mt-14 sm:grid-cols-4 sm:gap-6">
          {[
            { value: "10", label: "Editions" },
            { value: "120+", label: "Performers" },
            { value: "1000+", label: "Audience" },
            { value: "5+", label: "Art Forms" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-5 text-center backdrop-blur-sm sm:px-5 sm:py-6"
            >
              <p className="font-heading text-3xl text-amber-400 sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500 sm:text-[10px]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center sm:mt-14">
          <Link
            href="/legacy"
            className="inline-block rounded-full border border-amber-400/30 bg-amber-400/[0.08] px-8 py-3 font-mono text-[11px] uppercase tracking-widest text-amber-300 shadow-lg shadow-amber-900/10 transition-all duration-300 hover:scale-105 hover:border-amber-400/50 hover:bg-amber-400/[0.14] active:scale-95 sm:px-10 sm:py-3.5 sm:text-sm"
          >
            Explore the Legacy →
          </Link>
        </div>

        {/* Gold divider — bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      </section>

      {/* ── About SPARK ── */}
      <section className="relative mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/70 sm:text-[11px] sm:tracking-[0.35em]">Who we are</p>
          <h2 className="mt-3 font-heading text-4xl tracking-wide text-white sm:text-5xl md:text-6xl">About SPARK</h2>
        </div>

        <div className="mt-8 grid gap-5 sm:mt-14 sm:gap-6 md:grid-cols-3">
          {/* Card 1 — What is SPARK */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
            <span className="inline-block font-heading text-2xl text-amber-400 sm:text-3xl">SPARK</span>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
              The cultural committee of <span className="text-white">SPIT Mumbai</span>. We ignite creative expression through art, music, theatre, and the spoken word.
            </p>
          </div>

          {/* Card 2 — What is OpenMic */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
            <span className="inline-block font-heading text-2xl text-amber-400 sm:text-3xl">OpenMic</span>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
              An open stage for poetry, music, stand-up, spoken word, and storytelling. No filters. No limits. Just your voice and the mic.
            </p>
          </div>

          {/* Card 3 — 10th Edition */}
          <div className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.03] p-6 sm:p-8">
            <span className="inline-block font-heading text-2xl text-amber-400 sm:text-3xl">10th Edition</span>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
              {settings.event_date && settings.event_venue
                ? `${settings.event_date} at ${settings.event_venue}. `
                : ""}
              A decade of voices, a legacy of performances. The biggest edition yet.
            </p>
          </div>
        </div>
      </section>

      {/* ── Performer Registration ── */}
      <section className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/20 via-[#0a0e1a] to-[#020617] p-6 text-center sm:p-10">
          {/* inner glow band */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

          <h2 className="font-heading text-3xl tracking-wide text-amber-400 sm:text-5xl">Want to perform?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:mt-4 sm:text-[15px]">
            Register now to perform at SPARK OpenMic. This registration is <span className="font-semibold text-amber-400">for performers only</span>.
            Audience members do <span className="font-semibold text-white">not</span> need to register.
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-[15px]">
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

        <div className="text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/70 sm:text-[11px] sm:tracking-[0.35em]">Stay in the loop</p>
          <h2 className="mt-3 font-heading text-4xl tracking-wide text-white sm:text-5xl md:text-6xl">Announcements</h2>
        </div>
        <div className="mt-6 sm:mt-10">
          <AnnouncementsBoard announcements={latestAnnouncements} />
        </div>
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

