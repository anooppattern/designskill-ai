"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserMenu } from "./user-menu";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <h1 className="text-xl font-bold text-white tracking-tight">
            designskill <span className="text-blue-500">AI</span>
          </h1>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Link
                href="/extract"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Extract
              </Link>
              <UserMenu user={session.user} />
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
