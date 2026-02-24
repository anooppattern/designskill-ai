"use client";

import { GalleryCard } from "./gallery-card";

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

interface GalleryGridProps {
  extractions: GalleryExtraction[];
}

export function GalleryGrid({ extractions }: GalleryGridProps) {
  if (extractions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-zinc-400 mb-1">
          No design systems yet
        </h3>
        <p className="text-sm text-zinc-600">
          Be the first to extract a design system!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {extractions.map((extraction) => (
        <GalleryCard key={extraction.id} {...extraction} />
      ))}
    </div>
  );
}
