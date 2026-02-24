import Link from "next/link";

export const metadata = {
  title: "Auth Error — designskill AI",
};

export default function AuthErrorPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <div className="w-16 h-16 bg-red-950/50 border border-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Authentication Error
          </h2>
          <p className="text-zinc-400 text-sm mb-6">
            Something went wrong during authentication. Please try again.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
