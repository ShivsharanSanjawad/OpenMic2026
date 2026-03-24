"use client";

import { useRef, useCallback } from "react";
import { useMicScene } from "./MicScene";
import Link from "next/link";

export default function MicHero({ showLegacyLink = false }: { showLegacyLink?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { updateMouse } = useMicScene(containerRef);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      updateMouse(
        ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        -((e.clientY - rect.top) / rect.height - 0.5) * 2
      );
    },
    [updateMouse]
  );

  return (
    <section className="relative h-[100svh] w-full overflow-hidden" onMouseMove={handleMouseMove}>
      {/* "10th Edition" backdrop text — offset upward so it sits behind the mic like a stage curtain */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center"
        style={{ background: "#020617" }}
      >
        <div className="relative -translate-y-[55%] select-none text-center sm:-translate-y-[28%]">
          {/* Main large "10" — curtain feel: edges dark, center faintly lit */}
          <span
            className="block font-heading text-[clamp(150px,36vw,280px)] leading-[0.8] text-amber-200/[0.11] sm:text-[clamp(200px,34vw,500px)]"
            style={{
              textShadow:
                "0 0 60px rgba(245,175,50,0.22), 0 0 160px rgba(245,158,11,0.08)",
              letterSpacing: "-0.02em",
              /* Horizontal fade: fully faded at the sides, visible in the spotlight-lit center */
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 10%, black 20%, black 80%, rgba(0,0,0,0.8) 90%, transparent 100%)",
              maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 10%, black 20%, black 80%, rgba(0,0,0,0.8) 90%, transparent 100%)",
            }}
          >
            10
          </span>
          {/* "Edition" subtitle — very faint, barely legible like a dark stage curtain label */}
          <span
            className="block font-heading text-[clamp(48px,9vw,130px)] uppercase leading-none tracking-[0.35em] text-amber-200/[0.055]"
            style={{
              textShadow: "0 0 60px rgba(245,175,50,0.10)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 30%, black 48%, black 52%, rgba(0,0,0,0.5) 70%, transparent 100%)",
              maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 30%, black 48%, black 52%, rgba(0,0,0,0.5) 70%, transparent 100%)",
            }}
          >
            Edition
          </span>
        </div>
      </div>

      {/* Three.js canvas mounts here */}
      <div ref={containerRef} className="absolute inset-0 z-[2] h-full w-full" />

      {/* ── Theatrical spotlight beams — wide cones from upper corners converging on mic ── */}
      <svg
        className="pointer-events-none absolute inset-0 z-[10] h-full w-full"
        viewBox="0 0 1000 700"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          {/*
            Gradient axis travels from each fixture origin toward a point well
            below the mic (y=380) so the beam still carries warm light at y=252
            instead of fading to zero before it reaches the microphone.
          */}
          <linearGradient id="spl-l" x1="0" y1="0" x2="500" y2="380" gradientUnits="userSpaceOnUse">
            <stop offset="0%"  stopColor="#ffd060" stopOpacity="0.48" />
            <stop offset="30%" stopColor="#ffca60" stopOpacity="0.22" />
            <stop offset="62%" stopColor="#ffb840" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffa030" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="spl-r" x1="1000" y1="0" x2="500" y2="380" gradientUnits="userSpaceOnUse">
            <stop offset="0%"  stopColor="#ffe070" stopOpacity="0.44" />
            <stop offset="30%" stopColor="#ffd060" stopOpacity="0.20" />
            <stop offset="62%" stopColor="#ffb840" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#ffa030" stopOpacity="0" />
          </linearGradient>

          {/* Core — brighter strip down the axis of each beam */}
          <linearGradient id="spl-l-core" x1="0" y1="0" x2="500" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%"  stopColor="#ffe898" stopOpacity="0.60" />
            <stop offset="30%" stopColor="#ffd878" stopOpacity="0.26" />
            <stop offset="62%" stopColor="#ffcc60" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffb040" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="spl-r-core" x1="1000" y1="0" x2="500" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%"  stopColor="#ffe898" stopOpacity="0.55" />
            <stop offset="30%" stopColor="#ffd878" stopOpacity="0.23" />
            <stop offset="62%" stopColor="#ffcc60" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#ffb040" stopOpacity="0" />
          </linearGradient>

          {/* Pool — warm radial glow where both beams converge at the mic */}
          <radialGradient id="spl-pool" cx="500" cy="252" r="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%"  stopColor="#ffd878" stopOpacity="0.24" />
            <stop offset="50%" stopColor="#ffb840" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ff9020" stopOpacity="0" />
          </radialGradient>

          {/*
            Blur values tuned to the much wider base polygons below.
            spl-outer: very wide feather (32) so the ~430 px base cone has a
              smooth atmospheric edge rather than any visible boundary.
            spl-shaft: moderate (13) — keeps the main cone soft but gives it
              a recognisable shape without looking like a hard edge.
            spl-core: light (5) — just enough to avoid pixellation on the
              bright centre strip while keeping it visible and defined.
          */}
          <filter id="spl-outer" x="-30%" y="-10%" width="160%" height="130%">
            <feGaussianBlur stdDeviation="32" />
          </filter>
          <filter id="spl-shaft" x="-25%" y="-10%" width="150%" height="120%">
            <feGaussianBlur stdDeviation="13" />
          </filter>
          <filter id="spl-core" x="-60%" y="-10%" width="220%" height="120%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id="spl-pool-f" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="34" />
          </filter>
        </defs>

        {/*
          Left beam — base spans from the far-left edge to 430 px (43 % of viewBox).
          Three layers: wide hazy penumbra → visible shaft → bright core strip.
          All three share the same tip at (500,252) — the mic position.
        */}
        <polygon points="0,0 430,0 500,252"   fill="url(#spl-l)"      filter="url(#spl-outer)" opacity="0.95" />
        <polygon points="0,0 320,0 500,252"   fill="url(#spl-l)"      filter="url(#spl-shaft)" opacity="0.80" />
        <polygon points="0,0 200,0 500,252"   fill="url(#spl-l-core)" filter="url(#spl-core)"  opacity="0.65" />

        {/*
          Right beam — mirrors left: base from 570 px to right edge (1000).
        */}
        <polygon points="570,0 1000,0 500,252" fill="url(#spl-r)"      filter="url(#spl-outer)" opacity="0.90" />
        <polygon points="680,0 1000,0 500,252" fill="url(#spl-r)"      filter="url(#spl-shaft)" opacity="0.76" />
        <polygon points="800,0 1000,0 500,252" fill="url(#spl-r-core)" filter="url(#spl-core)"  opacity="0.62" />

        {/* Convergence pool — diffuse warm glow at the mic position */}
        <ellipse cx="500" cy="248" rx="220" ry="160"
          fill="url(#spl-pool)" filter="url(#spl-pool-f)" />
      </svg>

      {/* Bottom vignette — darkens the lower stage so text stays readable */}
      <div
        className="pointer-events-none absolute inset-0 z-[12]"
        style={{
          background: "linear-gradient(to top, #020617 0%, rgba(2,6,23,0.90) 22%, transparent 50%)",
        }}
      />

      {/* Dust motes inside left/right spotlight beams */}
      <div className="pointer-events-none absolute inset-0 z-[11] overflow-hidden">
        <div className="beam-particles beam-particles-left" />
        <div className="beam-particles beam-particles-left beam-particles-slow" />
        <div className="beam-particles beam-particles-right" />
        <div className="beam-particles beam-particles-right beam-particles-slow" />
      </div>

      {/* Text content */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end px-4 pb-8 sm:pb-12">
        <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/70 sm:mb-4 sm:text-[11px] sm:tracking-[0.35em]">
          Editorial Committee · SPIT Mumbai
        </p>

        <h1
          className="text-center font-heading text-[clamp(48px,12vw,128px)] leading-[0.88] tracking-wide text-white lg:text-[clamp(48px,5vw,72px)]"
          style={{ textShadow: "0 0 80px rgba(245,180,50,0.3)" }}
        >
          SPARK
          <br />
          <span className="text-amber-400">OpenMic</span>
        </h1>

        <p className="mb-6 mt-3 font-mono text-[11px] italic tracking-[0.15em] text-white/40 sm:mb-6 sm:mt-4 sm:text-sm sm:tracking-[0.2em]">
          your voice · your mic · your stage
        </p>

        <div className="pointer-events-auto mb-6 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:gap-4">
          <Link
            href="/register"
            className="rounded-full bg-amber-400 px-6 py-2.5 text-center font-mono text-[11px] uppercase tracking-widest text-slate-900 shadow-lg shadow-amber-400/25 transition-all duration-300 hover:scale-105 hover:bg-amber-300 sm:px-8 sm:py-3 sm:text-sm"
          >
            Register to Perform
          </Link>
          {showLegacyLink && (
            <Link
              href="/legacy"
              className="rounded-full border border-white/20 px-6 py-2.5 text-center font-mono text-[11px] uppercase tracking-widest text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:text-white sm:px-8 sm:py-3 sm:text-sm"
            >
              10 Years of Legacy
            </Link>
          )}
        </div>

        <div className="pointer-events-none flex flex-wrap justify-center gap-2 sm:gap-3">
          {["Poetry", "Music", "Spoken Word", "Stand-up", "Storytelling"].map((g) => (
            <span
              key={g}
              className="rounded-full border border-amber-400/20 px-3 py-1 font-mono text-[8px] uppercase tracking-[0.15em] text-amber-400/60 sm:px-4 sm:py-1.5 sm:text-[10px] sm:tracking-[0.2em]"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
