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

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-4xl font-black text-amber-300">About the Event</h2>
        <p className="mt-3 max-w-3xl text-zinc-300">
          SPARK OpenMic 10th Edition celebrates voice, poetry, music, and performance. Register your act,
          complete your UPI payment, and step into the spotlight.
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Date: {settings.event_date} · Venue: {settings.event_venue}
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="text-4xl font-black text-amber-300">How to Register</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ["1", "Fill Form"],
            ["2", "Pay via UPI"],
            ["3", "Perform"],
          ].map(([num, label]) => (
            <article key={num} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-amber-300">Step {num}</p>
              <h3 className="text-2xl">{label}</h3>
            </article>
          ))}
        </div>
        <Link href="/register" className="mt-6 inline-block rounded-lg bg-amber-500 px-5 py-2 font-semibold text-black">
          Register Now
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-4xl font-black text-amber-300">Latest Announcements</h2>
        <div className="mt-5">
          <AnnouncementsBoard announcements={latestAnnouncements} />
        </div>
      </section>

      <footer className="border-t border-zinc-800 px-6 py-8 text-sm text-zinc-400">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <p>© SPARK OpenMic 10th Edition</p>
          <p>Contact: sparkclub@college.edu</p>
        </div>
      </footer>
    </main>
  );
}
