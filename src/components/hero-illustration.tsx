"use client";

export function HeroIllustration() {
  return (
    <div className="relative max-w-3xl mx-auto mt-12 mb-4 px-4">
      {/* Glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative flex items-center justify-center gap-3 sm:gap-5">
        {/* URL / Website Card */}
        <div className="flex-shrink-0 w-[140px] sm:w-[180px]">
          <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-xl p-4 sm:p-5 backdrop-blur-sm">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-400/60" />
              <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
              <div className="w-2 h-2 rounded-full bg-green-400/60" />
            </div>
            {/* URL bar */}
            <div className="flex items-center gap-1.5 bg-zinc-800/80 rounded-lg px-2.5 py-1.5 mb-3">
              <svg className="w-3 h-3 text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span className="text-[10px] text-zinc-400 truncate">website.com</span>
            </div>
            {/* Page skeleton */}
            <div className="space-y-2">
              <div className="h-1.5 bg-zinc-700/50 rounded-full w-full" />
              <div className="h-1.5 bg-zinc-700/50 rounded-full w-4/5" />
              <div className="flex gap-1.5 mt-2.5">
                <div className="w-4 h-4 rounded bg-blue-500/30" />
                <div className="w-4 h-4 rounded bg-emerald-500/30" />
                <div className="w-4 h-4 rounded bg-purple-500/30" />
                <div className="w-4 h-4 rounded bg-amber-500/30" />
              </div>
              <div className="h-1.5 bg-zinc-700/50 rounded-full w-3/5 mt-2" />
              <div className="h-1.5 bg-zinc-700/50 rounded-full w-2/3" />
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 text-center mt-2.5 font-medium tracking-wide uppercase">Any Website</p>
        </div>

        {/* Arrow flow */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="flex items-center gap-0.5">
            <div className="w-6 sm:w-10 h-px bg-gradient-to-r from-blue-500/60 to-blue-400/80" />
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <span className="text-[9px] text-zinc-600 font-medium tracking-widest uppercase">extract</span>
        </div>

        {/* Design System (middle) */}
        <div className="flex-shrink-0 w-[120px] sm:w-[150px]">
          <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-xl p-4 sm:p-5 backdrop-blur-sm">
            {/* Design tokens icon */}
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
            </div>
            {/* Token rows */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-blue-500/40" />
                <div className="h-1.5 bg-zinc-700/50 rounded-full flex-1" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-500/40" />
                <div className="h-1.5 bg-zinc-700/50 rounded-full flex-1" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-zinc-500 font-mono w-3 text-center">Aa</span>
                <div className="h-1.5 bg-zinc-700/50 rounded-full flex-1" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-zinc-500 font-mono w-3 text-center">{}​</span>
                <div className="h-1.5 bg-zinc-700/50 rounded-full flex-1" />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 text-center mt-2.5 font-medium tracking-wide uppercase">Design System</p>
        </div>

        {/* Arrow flow */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="flex items-center gap-0.5">
            <div className="w-6 sm:w-10 h-px bg-gradient-to-r from-blue-400/80 to-orange-400/80" />
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <span className="text-[9px] text-zinc-600 font-medium tracking-widest uppercase">export</span>
        </div>

        {/* Claude Skill Card */}
        <div className="flex-shrink-0 w-[140px] sm:w-[180px]">
          <div className="bg-zinc-900/80 border border-orange-500/20 rounded-xl p-4 sm:p-5 backdrop-blur-sm relative overflow-hidden">
            {/* Subtle orange glow */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-orange-500/5 rounded-full blur-xl" />
            {/* Claude logo + file header */}
            <div className="flex items-center gap-2 mb-3 relative">
              {/* Claude logo - the spark/asterisk mark */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C12 2 14.5 8.5 16 10C17.5 11.5 22 12 22 12C22 12 17.5 12.5 16 14C14.5 15.5 12 22 12 22C12 22 9.5 15.5 8 14C6.5 12.5 2 12 2 12C2 12 6.5 11.5 8 10C9.5 8.5 12 2 12 2Z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-white truncate">Claude Skill</p>
                <p className="text-[9px] text-zinc-500 font-mono truncate">.md file</p>
              </div>
            </div>
            {/* Skill file preview lines */}
            <div className="space-y-1.5 font-mono relative">
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-orange-400/60">#</span>
                <div className="h-1.5 bg-orange-400/15 rounded-full w-3/4" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-zinc-600">-</span>
                <div className="h-1.5 bg-zinc-700/40 rounded-full w-full" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-zinc-600">-</span>
                <div className="h-1.5 bg-zinc-700/40 rounded-full w-4/5" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-zinc-600">-</span>
                <div className="h-1.5 bg-zinc-700/40 rounded-full w-3/5" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-orange-400/60">#</span>
                <div className="h-1.5 bg-orange-400/15 rounded-full w-1/2" />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 text-center mt-2.5 font-medium tracking-wide uppercase">Claude Skill</p>
        </div>
      </div>
    </div>
  );
}
