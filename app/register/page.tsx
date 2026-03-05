import Link from "next/link";
import { RegistrationForm } from "@/components/public/RegistrationForm";
import { RegistrationStatusLookup } from "@/components/public/RegistrationStatusLookup";
import { getPublicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const settings = await getPublicSettings();
  const isOpen = settings.registrations_open === "true";

  return (
    <main className="container mx-auto min-h-screen px-4 py-8 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="relative text-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-3xl"></div>
          </div>
          <div className="relative">
            <div className={`mb-4 inline-flex items-center rounded-full px-4 py-2 backdrop-blur-sm ${isOpen ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20" : "bg-red-500/20 border border-red-500/30"}`}>
              {isOpen ? (
                <>
                  <svg className="mr-2 h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-amber-300">Live Registration Open</span>
                </>
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm font-medium text-red-300">Registrations Closed</span>
                </>
              )}
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl md:text-8xl">
              <span className="block bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                SPARK
              </span>
              <span className="block text-4xl font-bold text-white sm:text-6xl md:text-7xl">OpenMic 10</span>
            </h1>
            <div className="mt-4 sm:mt-6 space-y-2">
              <p className="text-xl sm:text-2xl font-semibold text-amber-300">Registration Portal</p>
              <p className="mx-auto max-w-3xl text-base sm:text-lg text-zinc-300">
                🎤 For performers only • ✅ Perform only after verification
              </p>
            </div>
          </div>
        </div>

        {/* Performers-only + email note */}
        {isOpen && (
          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-950/20 px-4 py-3 text-sm">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-amber-200">
                <span className="font-bold text-amber-300">Performers only.</span> This form is for people who will be <strong className="text-white">performing on stage</strong>. Audience members do <strong className="text-white">not</strong> need to register.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-sky-500/30 bg-sky-950/20 px-4 py-3 text-sm">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sky-200">
                <span className="font-bold text-sky-300">Check your email carefully.</span> Your Registration ID will be emailed to you after submission. Keep it safe — you&apos;ll need it to check your status and receive further updates. <span className="text-white font-semibold">You can only perform once your payment is VERIFIED.</span>
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
