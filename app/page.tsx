import Link from "next/link";
import { HeroSection } from "@/components/public/HeroSection";
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
    <main>
      <HeroSection eventDate={settings.event_date} eventVenue={settings.event_venue} />

      {/* ── About SPARK ── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Who we are</p>
        <h2 className="mt-2 text-4xl font-black text-white">About SPARK</h2>
        <div className="mt-5 grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-lg leading-relaxed text-zinc-300">
              <span className="font-semibold text-amber-300">SPARK</span> is the cultural committee of{" "}
              <span className="font-semibold text-white">Sardar Patel Institute of Technology (SPIT), Mumbai</span>.
              We exist to ignite creative expression across campus — through art, music, theatre, and the spoken word.
            </p>
            <p className="mt-4 text-zinc-400">
              Every year we host a range of cultural events that push students to discover their talents, build
              confidence, and own the stage. OpenMic is our flagship event and a SPIT tradition.
            </p>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-zinc-300">
              <span className="font-semibold text-amber-300">SPARK OpenMic</span> — now in its{" "}
              <span className="font-semibold text-white">10th Edition</span> — is an open platform for poetry,
              spoken word, music, stand-up comedy, storytelling, and any form of vocal performance.
              No filters. No limits. Just your voice and the mic.
            </p>
            <p className="mt-4 text-zinc-400">
              {settings.event_date && settings.event_venue
                ? `Happening on ${settings.event_date} at ${settings.event_venue}.`
                : "Date and venue to be announced."}
              {" "}Register now and step into the spotlight.
            </p>
          </div>
        </div>
      </section>

      {/* ── Performer Registration ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 to-orange-950/20 p-6 sm:p-8">
          <h2 className="text-3xl sm:text-4xl font-black text-amber-300">Want to perform?</h2>
          <p className="mt-3 max-w-3xl text-sm sm:text-base text-amber-100/90">
            Register now to perform at SPARK OpenMic. This registration is <span className="font-bold text-amber-300">for performers only</span>.
            Audience members do <span className="font-semibold text-white">not</span> need to register.
          </p>
          <p className="mt-2 max-w-3xl text-sm sm:text-base text-zinc-300">
            You can perform <span className="font-semibold text-white">only after your payment is VERIFIED</span>. Your Registration ID will be sent to your email after submission.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link href="/register" className="inline-block rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-bold text-black shadow-lg shadow-amber-900/30 transition-transform hover:scale-105 active:scale-95">
              Register Now to Perform →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Latest Announcements ── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-4xl font-black text-amber-300">Latest Announcements</h2>
        <div className="mt-5">
          <AnnouncementsBoard announcements={latestAnnouncements} />
        </div>
        <Link href="/announcements" className="mt-6 inline-block text-sm text-amber-400 hover:underline">
          View all announcements →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800 px-6 py-8 text-sm text-zinc-400">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <p>© SPARK OpenMic 10th Edition · SPIT Mumbai</p>
          <p>
            Contact:{" "}
            <a href="mailto:spark@spit.ac.in" className="text-amber-400 hover:underline">
              spark@spit.ac.in
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}

