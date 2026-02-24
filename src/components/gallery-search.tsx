"use client";

import { useState, useCallback, useEffect } from "react";

interface GallerySearchProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export function GallerySearch({ onSearch, initialQuery = "" }: GallerySearchProps) {
  const [query, setQuery] = useState(initialQuery);

  const debouncedSearch = useCallback(
    (() => {
      let timeout: NodeJS.Timeout;
      return (value: string) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => onSearch(value), 300);
      };
    })(),
    [onSearch]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return (
    <div className="relative max-w-md mx-auto">
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
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search design systems..."
        className="w-full pl-11 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors"
      />
    </div>
  );
}
