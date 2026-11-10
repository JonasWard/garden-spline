import Link from 'next/link';

import { BASE_PATH } from '@/lib/base-path';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white flex flex-col items-center justify-center px-6 py-12 text-center">
      <img src={`${BASE_PATH}/logo.svg`} alt="Garden Spline logo" className="h-32 w-32 mb-8" />

      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white/90">Garden Spline</h1>
      <p className="mt-4 max-w-md text-base text-white/60">
        Silly little parametric shell configurator. Shape a gridshell, tweak its laths and export it as a PDF.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
        <Link
          href="/configurator"
          className="px-6 py-3 rounded-lg bg-[#f3d5a3] text-[#1a1a1a] font-medium hover:opacity-90"
        >
          Open configurator
        </Link>
        <Link
          href="/load"
          className="px-6 py-3 rounded-lg border border-white/20 text-white/80 hover:border-white/40"
        >
          Load a saved design
        </Link>
      </div>

      <a
        href="https://jonasward.ch/project/garden-spline/"
        className="mt-12 text-sm text-white/40 hover:text-white/70 underline underline-offset-4"
      >
        More about the project
      </a>
    </main>
  );
}
