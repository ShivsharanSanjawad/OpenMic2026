"use client";

import { useRef, useCallback } from "react";
import { useMicScene } from "./MicScene";
import Link from "next/link";

export default function MicHero() {
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
      {/* Three.js canvas mounts here */}
      <div ref={containerRef} className="absolute inset-0 h-full w-full" style={{ background: "#020617" }} />

      {/* Radial spotlight glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,200,80,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 100% 60% at 50% 100%, rgba(2,6,23,0.95) 0%, transparent 60%)
          `,
        }}
      />

      {/* Text content */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end px-4 pb-8 sm:pb-16">
        <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/70 sm:mb-4 sm:text-[11px] sm:tracking-[0.35em]">
          Cultural Committee · SPIT Mumbai
        </p>

        <h1
          className="text-center font-heading text-[clamp(48px,12vw,128px)] leading-[0.88] tracking-wide text-white"
          style={{ textShadow: "0 0 80px rgba(245,180,50,0.3)" }}
        >
          SPARK
          <br />
          <span className="text-amber-400">OpenMic</span>
        </h1>

        <p className="mb-6 mt-3 font-mono text-[11px] italic tracking-[0.15em] text-white/40 sm:mb-8 sm:mt-4 sm:text-sm sm:tracking-[0.2em]">
          your voice · your mic · your stage
        </p>

        <div className="pointer-events-auto mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:gap-4">
          <Link
            href="/register"
            className="rounded-full bg-amber-400 px-6 py-2.5 text-center font-mono text-[11px] uppercase tracking-widest text-slate-900 shadow-lg shadow-amber-400/25 transition-all duration-300 hover:scale-105 hover:bg-amber-300 sm:px-8 sm:py-3 sm:text-sm"
          >
            Register to Perform
          </Link>
          <Link
            href="/announcements"
            className="rounded-full border border-white/20 px-6 py-2.5 text-center font-mono text-[11px] uppercase tracking-widest text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:text-white sm:px-8 sm:py-3 sm:text-sm"
          >
            Updates
          </Link>
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
