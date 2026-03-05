import Link from "next/link";

type Props = {
  eventDate: string;
  eventVenue: string;
};

export function HeroSection({ eventDate, eventVenue }: Props) {
  return (
    <section className="relative overflow-hidden px-6 py-16 md:py-24">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#f5a62333_0%,#0a0a0a_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,#f59e0b11_90deg,transparent_160deg)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:6px_6px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">

          {/* ── Left: Text ── */}
          <div className="flex-1 text-center lg:text-left">
            <p className="animate-fade-in text-xs uppercase tracking-[0.4em] text-amber-300 opacity-0 [animation-delay:0.2s]">
              SPARK presents
            </p>
            <h1 className="animate-fade-in mt-3 bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-7xl font-black tracking-tight text-transparent opacity-0 [animation-delay:0.4s] md:text-8xl lg:text-9xl">
              OPEN MIC
            </h1>
            <div className="animate-fade-in mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/70 bg-amber-500/10 px-5 py-1 backdrop-blur-sm opacity-0 [animation-delay:0.6s]">
              <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              <span className="text-sm font-semibold text-amber-200">10th Edition</span>
            </div>
            <p className="animate-fade-in mt-6 text-2xl font-semibold text-zinc-100 opacity-0 [animation-delay:0.8s] md:text-3xl">
              THE STAGE IS YOURS
            </p>
            <div className="animate-fade-in mt-4 flex items-center justify-center gap-3 text-sm text-zinc-300 opacity-0 [animation-delay:1s] lg:justify-start md:text-base">
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-amber-400" />
                <span>{eventDate}</span>
              </div>
              <div className="h-4 w-px bg-zinc-600" />
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-amber-400" />
                <span>{eventVenue}</span>
              </div>
            </div>
            <div className="animate-fade-in mt-10 opacity-0 [animation-delay:1.2s]">
              <Link href="/register" className="btn-primary inline-block">
                Register Now
              </Link>
            </div>
          </div>

          {/* ── Right: YouTube Short ── */}
          <div className="animate-fade-in w-full max-w-xs flex-shrink-0 opacity-0 [animation-delay:0.5s] sm:max-w-sm lg:max-w-[280px] xl:max-w-xs">
            <div className="overflow-hidden rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-900/30">
              <div className="relative aspect-[9/16] bg-black">
                <iframe
                  src="https://www.youtube.com/embed/gKMeOf2Xkpk?autoplay=1&mute=1&loop=1&playlist=gKMeOf2Xkpk&controls=1&rel=0&modestbranding=1"
                  title="SPARK OpenMic teaser"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
