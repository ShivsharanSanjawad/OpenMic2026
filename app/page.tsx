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

      {/* ── Teaser Video ── */}
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-amber-400/20 shadow-2xl shadow-amber-900/20">
          <div className="relative aspect-video w-full bg-black">
            <video
              src="https://res.cloudinary.com/dj0kep34k/video/upload/q_auto,f_auto/spark/openmic/teaser/spark-openmic-10-teaser.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls
              className="absolute inset-0 h-full w-full object-contain"
              aria-label="SPARK OpenMic teaser video"
            />
          </div>
        </div>
      </section>

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
      <section className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="text-4xl font-black text-amber-300">How to Register</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ["1", "Fill the Form", "Enter your details, performance type, and any team members."],
            ["2", "Pay via UPI", "Scan the QR or use the UPI ID and upload your payment screenshot."],
            ["3", "Perform!", "Our team reviews your registration and you'll receive a confirmation email."],
          ].map(([num, label, desc]) => (
            <article key={num} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur">
              <p className="text-sm font-bold text-amber-400">Step {num}</p>
              <h3 className="mt-1 text-xl font-bold text-white">{label}</h3>
              <p className="mt-2 text-sm text-zinc-400">{desc}</p>
            </article>
          ))}
        </div>
        <Link href="/register" className="mt-8 inline-block rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-bold text-black shadow-lg shadow-amber-900/30 transition-transform hover:scale-105">
          Register Now →
        </Link>
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

