import { RegistrationForm } from "@/components/public/RegistrationForm";
import { RegistrationStatusLookup } from "@/components/public/RegistrationStatusLookup";
import { getPublicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const settings = await getPublicSettings();

  return (
    <main className="container mx-auto min-h-screen px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="relative text-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-3xl"></div>
          </div>
          <div className="relative">
            <div className="mb-4 inline-flex items-center rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-4 py-2 backdrop-blur-sm">
              <svg className="mr-2 h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-amber-300">Live Registration Open</span>
            </div>
            <h1 className="text-6xl font-black tracking-tight text-white sm:text-7xl md:text-8xl">
              <span className="block bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                SPARK
              </span>
              <span className="block text-5xl font-bold text-white sm:text-6xl md:text-7xl">OpenMic 10</span>
            </h1>
            <div className="mt-6 space-y-2">
              <p className="text-2xl font-semibold text-amber-300">Registration Portal</p>
              <p className="mx-auto max-w-3xl text-lg text-zinc-300">
                🎤 Showcase your talent • 💰 Complete payment • 🌟 Own the stage
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <RegistrationForm settings={settings} />
        </div>

        <div className="mt-20">
          <RegistrationStatusLookup />
        </div>
      </div>
    </main>
  );
}
