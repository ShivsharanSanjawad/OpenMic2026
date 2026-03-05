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

      {/* ── How to Register ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <h2 className="text-3xl sm:text-4xl font-black text-amber-300">How to Register</h2>

        {/* Performers-only callout */}
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-950/20 px-5 py-4">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-amber-200">
            <span className="font-bold text-amber-300">Performers only.</span>{" "}
            Registration is for people who will be <span className="font-semibold text-white">performing on stage</span>. If you&apos;re coming as an audience member, <span className="font-semibold text-white">no registration is needed</span> — just show up and enjoy the show!
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[
            {
              num: "1",
              emoji: "📝",
              label: "Fill the Form",
              desc: "Enter your details, performance type, and team members. Make sure your email is correct — your Registration ID will be sent there.",
            },
            {
              num: "2",
              emoji: "💸",
              label: "Pay via UPI",
              desc: "Scan the QR code or use the UPI ID provided to complete payment, then upload your payment screenshot.",
            },
            {
              num: "3",
              emoji: "🎤",
              label: "Get Verified & Perform!",
              desc: "Our team reviews your payment. You'll receive your Registration ID via email — keep it safe. You can only perform once VERIFIED.",
            },
          ].map(({ num, emoji, label, desc }) => (
            <article key={num} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-black text-black flex-shrink-0">{num}</span>
                <span className="text-2xl">{emoji}</span>
              </div>
              <h3 className="mt-3 text-xl font-bold text-white">{label}</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="/register" className="inline-block rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-bold text-black shadow-lg shadow-amber-900/30 transition-transform hover:scale-105 active:scale-95">
            Register Now →
          </Link>
          <p className="text-sm text-zinc-500">Audience members do not need to register.</p>
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

