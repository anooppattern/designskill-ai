"use client";

import { useState } from "react";

interface VisibilityToggleProps {
  extractionId: string;
  initialVisibility: "PUBLIC" | "PRIVATE";
}

export function VisibilityToggle({
  extractionId,
  initialVisibility,
}: VisibilityToggleProps) {
  const [visibility, setVisibility] = useState(initialVisibility);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const newVisibility = visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    setLoading(true);

    try {
      const res = await fetch(`/api/extractions/${extractionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: newVisibility }),
      });

      if (res.ok) {
        setVisibility(newVisibility);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  const isPublic = visibility === "PUBLIC";

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        isPublic
          ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800 hover:bg-emerald-950"
          : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
      }`}
    >
      {isPublic ? (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )}
      {isPublic ? "Public" : "Private"}
    </button>
  );
}
