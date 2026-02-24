"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useExtraction } from "@/hooks/use-extraction";
import { ProgressDisplay } from "@/components/progress-display";

export default function ExtractPage() {
  const router = useRouter();
  const { state, progress, extractionId, error, extract, reset } = useExtraction();
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [checking, setChecking] = useState(false);
  const [existingMatch, setExistingMatch] = useState<{
    id: string;
    siteName: string;
    createdAt: string;
  } | null>(null);

  // Redirect to detail page on completion
  if (state === "complete" && extractionId) {
    router.push(`/skills/${extractionId}`);
  }

  function validateUrl(input: string): string {
    let normalized = input.trim();
    if (!normalized) return "";
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    try {
      const parsed = new URL(normalized);
      if (!["http:", "https:"].includes(parsed.protocol)) return "";
      return normalized;
    } catch {
      return "";
    }
  }

  const checkAndExtract = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setUrlError("");
      setExistingMatch(null);

      const validUrl = validateUrl(url);
      if (!validUrl) {
        setUrlError("Please enter a valid URL");
        return;
      }

      // Check for existing extraction
      setChecking(true);
      try {
        const res = await fetch("/api/extractions/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: validUrl }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.exists && data.extraction) {
            setExistingMatch(data.extraction);
            setChecking(false);
            return;
          }
        }
      } catch {
        // Proceed with extraction if check fails
      }

      setChecking(false);
      extract(validUrl);
    },
    [url, extract]
  );

  const forceExtract = useCallback(() => {
    const validUrl = validateUrl(url);
    if (validUrl) {
      setExistingMatch(null);
      extract(validUrl);
    }
  }, [url, extract]);

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            Extract a design system
          </h1>
          <p className="text-zinc-400 max-w-lg mx-auto">
            Enter a website URL to extract its design system
            and export it as a ready-to-use Claude skill.
          </p>
        </div>

        {/* URL Input Form — shown when idle or error */}
        {(state === "idle" || state === "error") && !existingMatch && (
          <form onSubmit={checkAndExtract} className="max-w-xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setUrlError("");
                  }}
                  placeholder="https://example.com"
                  className={`w-full pl-11 pr-4 py-3 bg-zinc-900 border rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-1 transition-colors ${
                    urlError
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-zinc-800 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={checking || !url.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl text-sm transition-colors whitespace-nowrap"
              >
                {checking ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Checking...
                  </span>
                ) : (
                  "Extract"
                )}
              </button>
            </div>

            {urlError && (
              <p className="mt-2 text-red-400 text-sm">{urlError}</p>
            )}

            {state === "error" && error && (
              <div className="mt-4 p-4 bg-red-950/50 border border-red-800 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </form>
        )}

        {/* Existing match dialog */}
        {existingMatch && state === "idle" && (
          <div className="max-w-xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Already Extracted
              </h3>
              <p className="text-sm text-zinc-400 mb-1">
                <span className="text-white font-medium">{existingMatch.siteName}</span> was
                already extracted on{" "}
                {new Date(existingMatch.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => router.push(`/skills/${existingMatch.id}`)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  View Existing
                </button>
                <button
                  onClick={forceExtract}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
                >
                  Re-extract
                </button>
                <button
                  onClick={() => {
                    setExistingMatch(null);
                    reset();
                  }}
                  className="px-5 py-2.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Extracting state */}
        {state === "extracting" && (
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-xl font-bold text-white mb-2">
              Extracting design system...
            </h2>
            <p className="text-zinc-400 text-sm mb-8">
              Browsing the site and analyzing its styles
            </p>
            {progress && <ProgressDisplay progress={progress} />}
          </div>
        )}

        {/* Complete state without extractionId (not saved — shouldn't happen for logged-in users) */}
        {state === "complete" && !extractionId && (
          <div className="max-w-xl mx-auto text-center">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Extraction Complete</h2>
            <p className="text-zinc-400 text-sm mb-6">
              The design system was extracted but could not be saved.
            </p>
            <button
              onClick={reset}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Extract Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
