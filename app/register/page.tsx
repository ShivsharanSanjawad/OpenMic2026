import Link from "next/link";
import { RegistrationForm } from "@/components/public/RegistrationForm";
import { RegistrationStatusLookup } from "@/components/public/RegistrationStatusLookup";
import { getPublicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const settings = await getPublicSettings();
  const isOpen = settings.registrations_open === "true";

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-10 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <div className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 ${isOpen ? "border-amber-400/30 bg-amber-400/[0.06]" : "border-red-500/30 bg-red-500/[0.06]"}`}>
            {isOpen ? (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-widest text-amber-300">Registrations Open</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="font-mono text-[11px] uppercase tracking-widest text-red-300">Registrations Closed</span>
              </>
            )}
          </div>
          <h1 className="font-heading text-5xl tracking-wide text-white sm:text-7xl md:text-8xl">
            SPARK <span className="text-amber-400">OpenMic</span>
          </h1>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500 sm:text-xs sm:tracking-[0.35em]">
            Registration Portal — 10th Edition
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400 sm:text-base">
            For performers only. You can perform only after payment verification.
          </p>
        </div>

        {/* Performers-only + email note */}
        {isOpen && (
          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-sm">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-zinc-300">
                <span className="font-semibold text-amber-400">Performers only.</span> This form is for people who will be <strong className="text-white">performing on stage</strong>. Audience members do <strong className="text-white">not</strong> need to register.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-sm">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-zinc-300">
                <span className="font-semibold text-amber-400">Check your email.</span> Your Registration ID will be emailed after submission. Keep it safe — you&apos;ll need it to check your status. <span className="text-white font-semibold">You can only perform once your payment is VERIFIED.</span>
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 sm:mt-12">
          {isOpen ? (
            <RegistrationForm settings={settings} />
          ) : (
            <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-300">Registrations are Closed</h2>
              <p className="mt-2 text-zinc-400">
                New registrations are not being accepted at this time. Please check back later or follow our announcements for updates.
              </p>
              <Link href="/announcements" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/30 px-5 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/30 transition-colors">
                View Announcements
              </Link>
            </div>
          )}
        </div>

        <div className="mt-20">
          <RegistrationStatusLookup />
        </div>
      </div>
    </main>
  );
}
