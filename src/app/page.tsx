"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { GalleryGrid } from "@/components/gallery-grid";
import { GallerySearch } from "@/components/gallery-search";
import { HeroIllustration } from "@/components/hero-illustration";

interface GalleryExtraction {
  id: string;
  url: string;
  faviconUrl: string | null;
  siteName: string;
  skillName: string;
  previewColors: { value: string; name: string }[];
  createdAt: string;
  user: { name: string | null; image: string | null };
}

export default function Home() {
  const { data: session } = useSession();
  const [extractions, setExtractions] = useState<GalleryExtraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchExtractions = useCallback(async (query: string) => {
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (query) params.set("search", query);
      const res = await fetch(`/api/extractions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setExtractions(data.extractions);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExtractions(search);
  }, [search, fetchExtractions]);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400 font-medium mb-6">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI-Powered Design System Extraction
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Extract design systems,
            <br />
            <span className="text-blue-500">export as Claude skills</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-8">
            Extract a design system from any website and export it as a Claude skill.
            Colors, typography, spacing — ready to use in seconds.
          </p>
          <Link
            href={session ? "/extract" : "/auth/signin"}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Extract a Website
          </Link>

          {/* Hero illustration */}
          <HeroIllustration />
        </div>
      </section>

      {/* Gallery */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-semibold text-white">
            Public Design Systems
          </h3>
        </div>

        <div className="mb-8">
          <GallerySearch onSearch={handleSearch} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="h-2 bg-zinc-800" />
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-md bg-zinc-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-zinc-800 rounded w-3/4" />
                      <div className="h-3 bg-zinc-800 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="flex gap-1.5 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="w-6 h-6 rounded-md bg-zinc-800" />
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-zinc-800 rounded w-20" />
                    <div className="h-3 bg-zinc-800 rounded w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <GalleryGrid extractions={extractions} />
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-zinc-600">
          designskill AI — Extract design systems, export as Claude skills
        </div>
      </footer>
    </div>
  );
}
