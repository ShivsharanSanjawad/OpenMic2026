import Link from "next/link";

const editions = [
  {
    year: "2017",
    edition: "1st",
    tagline: "Where it all began",
    highlight: "The first ever SPARK OpenMic at SPIT — 15 brave performers, one mic, and a dream that started a legacy.",
    performers: 15,
  },
  {
    year: "2018",
    edition: "2nd",
    tagline: "The word spreads",
    highlight: "Double the performers, double the energy. Poetry and music took center stage as OpenMic found its identity.",
    performers: 30,
  },
  {
    year: "2019",
    edition: "3rd",
    tagline: "Standing ovation",
    highlight: "Stand-up comedy joined the lineup. The crowd roared. OpenMic was no longer just an event — it was a movement.",
    performers: 45,
  },
  {
    year: "2020",
    edition: "4th",
    tagline: "Voices through screens",
    highlight: "The pandemic couldn't silence us. OpenMic went virtual — proving that art finds a way, always.",
    performers: 35,
  },
  {
    year: "2021",
    edition: "5th",
    tagline: "The digital stage",
    highlight: "A hybrid edition that blended the intimacy of a live mic with the reach of the internet. Spoken word exploded.",
    performers: 50,
  },
  {
    year: "2022",
    edition: "6th",
    tagline: "Return to the stage",
    highlight: "Back in person. The energy was electric. Performers who'd waited two years finally felt the spotlight again.",
    performers: 60,
  },
  {
    year: "2023",
    edition: "7th",
    tagline: "Breaking records",
    highlight: "Our biggest edition yet at the time. Cross-college artists, guest performers, and a night that ran past midnight.",
    performers: 75,
  },
  {
    year: "2024",
    edition: "8th",
    tagline: "The cultural peak",
    highlight: "Storytelling became the breakout genre. Every seat was taken. Every voice was heard.",
    performers: 85,
  },
  {
    year: "2025",
    edition: "9th",
    tagline: "Louder than ever",
    highlight: "Multi-genre showcases, live collaborations, and the most diverse performer lineup in OpenMic history.",
    performers: 100,
  },
  {
    year: "2026",
    edition: "10th",
    tagline: "A decade of voices",
    highlight: "The milestone edition. 10 years of raw talent, courage, and the belief that every voice deserves a stage.",
    performers: null,
  },
];

export default function LegacyPage() {
  return (
    <main className="min-h-screen bg-[#020617]">
      {/* Hero banner */}
      <section className="relative flex flex-col items-center justify-center px-5 pb-16 pt-20 text-center sm:px-6 sm:pb-24 sm:pt-28">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(245,158,11,0.06) 0%, transparent 70%)",
          }}
        />

        <p className="relative font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/70 sm:text-[11px] sm:tracking-[0.35em]">
          SPARK OpenMic · SPIT Mumbai
        </p>
        <h1 className="relative mt-4 font-heading text-5xl tracking-wide text-white sm:text-7xl md:text-8xl">
          10 Years
          <br />
          <span className="text-amber-400">of Legacy</span>
        </h1>
        <p className="relative mt-4 max-w-lg font-mono text-[11px] italic tracking-[0.15em] text-white/35 sm:text-sm sm:tracking-[0.2em]">
          a decade of raw voices, brave stages, and unforgettable nights
        </p>
      </section>

      {/* Timeline */}
      <section className="relative mx-auto max-w-4xl px-5 pb-20 sm:px-6 sm:pb-32">
        {/* Center line */}
        <div className="absolute inset-y-0 left-[22px] w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent sm:left-1/2 sm:-translate-x-px" />

        <div className="space-y-12 sm:space-y-16">
          {editions.map((ed, i) => {
            const isRight = i % 2 === 1;
            const isCurrent = ed.year === "2026";

            return (
              <div key={ed.year} className="relative">
                {/* Dot on timeline */}
                <div
                  className={`absolute left-[22px] top-1 z-10 -translate-x-1/2 sm:left-1/2 ${
                    isCurrent ? "h-4 w-4" : "h-2.5 w-2.5"
                  } rounded-full border-2 ${
                    isCurrent
                      ? "border-amber-400 bg-amber-400 shadow-lg shadow-amber-400/50"
                      : "border-amber-400/30 bg-[#020617]"
                  }`}
                />

                {/* Card — stacks left on mobile, alternates on desktop */}
                <div
                  className={`ml-12 sm:ml-0 sm:w-[calc(50%-2rem)] ${
                    isRight ? "sm:ml-auto sm:pl-0" : "sm:mr-auto sm:pr-0"
                  }`}
                >
                  <div
                    className={`group relative overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-900/10 sm:p-6 ${
                      isCurrent
                        ? "border-amber-400/30 bg-gradient-to-br from-amber-500/[0.08] via-transparent to-transparent"
                        : "border-white/[0.06] bg-white/[0.02]"
                    }`}
                  >
                    {/* Top accent */}
                    <div
                      className={`absolute inset-x-0 top-0 h-px ${
                        isCurrent
                          ? "bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"
                          : "bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      }`}
                    />

                    <div className="mb-2 flex items-baseline gap-3">
                      <span className="font-heading text-3xl tracking-wide text-amber-400 sm:text-4xl">
                        {ed.year}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 sm:text-[10px]">
                        {ed.edition} edition
                      </span>
                    </div>

                    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400/50 sm:text-[11px]">
                      {ed.tagline}
                    </p>

                    <p className="text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
                      {ed.highlight}
                    </p>

                    {ed.performers && (
                      <div className="mt-4 flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-amber-400/40" />
                        <span className="font-mono text-[10px] tracking-wider text-zinc-600">
                          {ed.performers}+ performers
                        </span>
                      </div>
                    )}

                    {isCurrent && (
                      <div className="mt-5">
                        <Link
                          href="/register"
                          className="inline-block rounded-full bg-amber-400 px-6 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-900 shadow-lg shadow-amber-400/20 transition-all duration-300 hover:scale-105 hover:bg-amber-300 sm:text-[11px]"
                        >
                          Be part of the 10th →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-white/5 px-5 py-14 text-center sm:px-6 sm:py-20">
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/50 sm:text-[11px]">
          The stage is yours
        </p>
        <h2 className="mt-3 font-heading text-4xl tracking-wide text-white sm:text-5xl">
          Write the next chapter
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-zinc-500 sm:text-base">
          10 years of memories. Hundreds of voices. One legendary stage. Your turn.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            href="/register"
            className="rounded-full bg-amber-400 px-8 py-3 font-mono text-[11px] uppercase tracking-widest text-slate-900 shadow-lg shadow-amber-400/25 transition-all duration-300 hover:scale-105 hover:bg-amber-300 sm:text-sm"
          >
            Register to Perform
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-8 py-3 font-mono text-[11px] uppercase tracking-widest text-white/60 transition-all duration-300 hover:border-white/30 hover:text-white sm:text-sm"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
