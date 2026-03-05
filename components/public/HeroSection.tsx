import Link from "next/link";

type Props = {
  eventDate: string;
  eventVenue: string;
};

export function HeroSection({ eventDate, eventVenue }: Props) {
  return (
    <section className="relative overflow-hidden px-6 py-24 text-center md:py-36">
      {/* Background gradients and patterns */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#f5a62333_0%,#0a0a0a_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,#f59e0b11_90deg,transparent_160deg)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:6px_6px]" />
      
      {/* Animated floating elements */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-amber-500/10 to-amber-600/5 blur-xl" />
      <div className="pointer-events-none absolute right-1/3 top-2/3 h-24 w-24 animate-pulse rounded-full bg-gradient-to-br from-amber-400/10 to-amber-500/5 blur-xl delay-700" />
      
      <div className="relative mx-auto max-w-4xl">
        <p className="animate-fade-in text-xs uppercase tracking-[0.4em] text-amber-300 opacity-0 [animation-delay:0.2s] [animation-fill-mode:forwards]">
          SPARK presents
        </p>
        <h1 className="animate-fade-in mt-3 bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-6xl font-black tracking-tight text-transparent opacity-0 [animation-delay:0.4s] [animation-fill-mode:forwards] md:text-8xl">
          OPEN MIC
        </h1>
        <div className="animate-fade-in mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/70 bg-amber-500/10 px-5 py-1 backdrop-blur-sm opacity-0 [animation-delay:0.6s] [animation-fill-mode:forwards]">
          <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          <span className="text-sm font-semibold text-amber-200">10th Edition</span>
        </div>
        <p className="animate-fade-in mt-6 text-2xl font-semibold text-zinc-100 opacity-0 [animation-delay:0.8s] [animation-fill-mode:forwards] md:text-3xl">
          THE STAGE IS YOURS
        </p>
        <div className="animate-fade-in mt-6 flex items-center justify-center gap-3 text-sm text-zinc-300 opacity-0 [animation-delay:1s] [animation-fill-mode:forwards] md:text-base">
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
        <Link
          href="/register"
          className="animate-fade-in btn-primary mt-10 inline-block opacity-0 [animation-delay:1.2s] [animation-fill-mode:forwards]"
        >
          Register Now
        </Link>
      </div>
    </section>
  );
}
