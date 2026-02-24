"use client";

import { useState, FormEvent } from "react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [isValid, setIsValid] = useState(true);

  const validate = (value: string): boolean => {
    if (!value) return true; // empty is neutral
    try {
      const parsed = new URL(value);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url) return;
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    if (validate(normalized)) {
      onSubmit(normalized);
    } else {
      setIsValid(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setIsValid(true);
            }}
            placeholder="https://example.com"
            disabled={isLoading}
            className={`w-full px-4 py-3 bg-zinc-900 border rounded-lg text-white placeholder-zinc-500 outline-none transition-colors ${
              !isValid
                ? "border-red-500 focus:border-red-500"
                : "border-zinc-700 focus:border-blue-500"
            } disabled:opacity-50`}
          />
          {!isValid && (
            <p className="absolute -bottom-6 left-0 text-red-400 text-sm">
              Please enter a valid URL
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
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
              Extracting...
            </span>
          ) : (
            "Extract Design System"
          )}
        </button>
      </div>
    </form>
  );
}
