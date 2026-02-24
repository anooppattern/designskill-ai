"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DesignSystemView } from "@/components/design-system-view";
import { ClaudeMdOutput } from "@/components/claude-md-output";
import { VisibilityToggle } from "@/components/visibility-toggle";
import type { DesignSystem } from "@/lib/types";

interface ExtractionDetail {
  id: string;
  url: string;
  faviconUrl: string | null;
  siteName: string;
  screenshotUrl: string | null;
  designSystem: DesignSystem;
  claudeMd: string;
  skillName: string;
  fileName: string;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: string;
  isOwner: boolean;
  user: { name: string | null; image: string | null };
}

export default function SkillDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<ExtractionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/extractions/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Design system not found");
          } else {
            setError("Failed to load");
          }
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError("Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function shareLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Loading design system...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{error || "Not found"}</h2>
          <p className="text-zinc-400 text-sm mb-6">
            This design system may be private or doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  let hostname = "";
  try {
    hostname = new URL(data.url).hostname;
  } catch {
    hostname = data.url;
  }

  const ds = data.designSystem as DesignSystem;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Gallery
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            {data.faviconUrl ? (
              <img
                src={data.faviconUrl}
                alt=""
                className="w-12 h-12 rounded-xl flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{data.skillName}</h1>
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {hostname}
                <svg className="w-3 h-3 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                <div className="flex items-center gap-1.5">
                  {data.user.image ? (
                    <img src={data.user.image} alt="" className="w-4 h-4 rounded-full" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-zinc-700" />
                  )}
                  <span>{data.user.name || "Anonymous"}</span>
                </div>
                <span>&middot;</span>
                <span>{new Date(data.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {data.isOwner && (
              <VisibilityToggle
                extractionId={data.id}
                initialVisibility={data.visibility}
              />
            )}
            <button
              onClick={shareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs text-zinc-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {copied ? "Copied!" : "Share"}
            </button>
          </div>
        </div>

        {/* Website Screenshot Preview */}
        {data.screenshotUrl && (
          <div className="mb-10">
            <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/80">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="bg-zinc-800 rounded-md px-3 py-1 text-xs text-zinc-500 text-center truncate">
                    {data.url}
                  </div>
                </div>
              </div>
              <img
                src={data.screenshotUrl}
                alt={`Screenshot of ${data.siteName}`}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Design System View */}
        <div className="space-y-16">
          <section>
            <DesignSystemView designSystem={ds} />
          </section>

          <hr className="border-zinc-800" />

          <section>
            <ClaudeMdOutput
              content={data.claudeMd}
              skillName={data.skillName}
              fileName={data.fileName}
            />
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-zinc-600">
          designskill AI — Extract design systems, export as Claude skills
        </div>
      </footer>
    </div>
  );
}
