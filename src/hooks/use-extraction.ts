"use client";

import { useState, useCallback } from "react";
import type {
  ExtractionProgress,
  DesignSystem,
  SSEEvent,
} from "@/lib/types";

export type ExtractionState = "idle" | "extracting" | "complete" | "error";

export function useExtraction() {
  const [state, setState] = useState<ExtractionState>("idle");
  const [progress, setProgress] = useState<ExtractionProgress | null>(null);
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null);
  const [claudeMd, setClaudeMd] = useState<string>("");
  const [skillName, setSkillName] = useState<string>("");
  const [fileName, setFileName] = useState<string>("CLAUDE.md");
  const [extractionId, setExtractionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extract = useCallback(async (url: string) => {
    setState("extracting");
    setError(null);
    setDesignSystem(null);
    setClaudeMd("");
    setSkillName("");
    setFileName("CLAUDE.md");
    setExtractionId(null);
    setProgress({
      type: "progress",
      phase: "connecting",
      message: "Connecting...",
      percent: 0,
    });

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server error: ${response.status}`
        );
      }

      if (!response.body) {
        throw new Error("No response body — streaming not supported");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          try {
            const event: SSEEvent = JSON.parse(trimmed.slice(6));
            if (event.type === "progress") {
              setProgress(event);
            } else if (event.type === "result") {
              setDesignSystem(event.designSystem);
              setClaudeMd(event.claudeMd);
              setSkillName(event.skillName);
              setFileName(event.fileName);
              if (event.extractionId) {
                setExtractionId(event.extractionId);
              }
              setState("complete");
            } else if (event.type === "error") {
              setError(event.message);
              setState("error");
            }
          } catch {
            // malformed JSON, skip
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setState("error");
    }
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setProgress(null);
    setDesignSystem(null);
    setClaudeMd("");
    setSkillName("");
    setFileName("CLAUDE.md");
    setExtractionId(null);
    setError(null);
  }, []);

  return {
    state,
    progress,
    designSystem,
    claudeMd,
    skillName,
    fileName,
    extractionId,
    error,
    extract,
    reset,
  };
}
