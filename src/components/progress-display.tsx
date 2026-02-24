"use client";

import type { ExtractionProgress } from "@/lib/types";

interface ProgressDisplayProps {
  progress: ExtractionProgress;
}

const PHASES = [
  { key: "launching-browser", label: "Launching browser" },
  { key: "navigating", label: "Navigating to site" },
  { key: "css-variables", label: "Extracting CSS variables" },
  { key: "stylesheets", label: "Parsing stylesheets" },
  { key: "computed-styles", label: "Analyzing computed styles" },
  { key: "colors", label: "Processing colors" },
  { key: "typography", label: "Analyzing typography" },
  { key: "spacing", label: "Extracting spacing & layout" },
  { key: "breakpoints", label: "Extracting breakpoints" },
  { key: "generating", label: "Generating CLAUDE.md" },
];

export function ProgressDisplay({ progress }: ProgressDisplayProps) {
  const currentIndex = PHASES.findIndex((p) => p.key === progress.phase);

  return (
    <div className="w-full max-w-xl mx-auto mt-12">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-zinc-400 mb-2">
          <span>{progress.message}</span>
          <span>{progress.percent}%</span>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {/* Phase checklist */}
      <div className="space-y-2">
        {PHASES.map((phase, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div
              key={phase.key}
              className={`flex items-center gap-3 text-sm transition-colors ${
                isCompleted
                  ? "text-green-400"
                  : isCurrent
                    ? "text-blue-400"
                    : "text-zinc-600"
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center">
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : isCurrent ? (
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-zinc-700" />
                )}
              </span>
              <span>{phase.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
