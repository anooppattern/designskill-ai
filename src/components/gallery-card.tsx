"use client";

import Link from "next/link";

interface GalleryCardProps {
  id: string;
  url: string;
  faviconUrl: string | null;
  siteName: string;
  skillName: string;
  previewColors: { value: string; name: string }[];
  createdAt: string;
  user: { name: string | null; image: string | null };
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function GalleryCard({
  id,
  url,
  faviconUrl,
  siteName,
  skillName,
  previewColors,
  createdAt,
  user,
}: GalleryCardProps) {
  let hostname = "";
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    hostname = url;
  }

  return (
    <Link
      href={`/skills/${id}`}
      className="group block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all duration-200 hover:shadow-lg hover:shadow-black/20"
    >
      {/* Color strip */}
      {previewColors.length > 0 && (
        <div className="flex h-2">
          {previewColors.map((c, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
      )}

      <div className="p-5">
        {/* Header with favicon and name */}
        <div className="flex items-start gap-3 mb-3">
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt=""
              className="w-8 h-8 rounded-md flex-shrink-0 mt-0.5"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-semibold text-sm truncate group-hover:text-blue-400 transition-colors">
              {skillName || siteName}
            </h3>
            <p className="text-zinc-500 text-xs truncate">{hostname}</p>
          </div>
        </div>

        {/* Color swatches */}
        {previewColors.length > 0 && (
          <div className="flex gap-1.5 mb-4">
            {previewColors.map((c, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-md border border-zinc-700"
                style={{ backgroundColor: c.value }}
                title={`${c.name} (${c.value})`}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            {user.image ? (
              <img src={user.image} alt="" className="w-4 h-4 rounded-full" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-zinc-700" />
            )}
            <span className="truncate max-w-[100px]">{user.name || "Anonymous"}</span>
          </div>
          <span>{timeAgo(createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
