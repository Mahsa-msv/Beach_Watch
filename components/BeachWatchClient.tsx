"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import StatsBar from "@/components/StatsBar";
import type { Beach } from "@/lib/types";
import { STATUS_META } from "@/lib/types";

// Leaflet touches window, so load the map only on the client.
const BeachMap = dynamic(() => import("@/components/BeachMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-card bg-surface-alt text-ink-soft">
      Loading map
    </div>
  ),
});

interface Props {
  beaches: Beach[];
  lastUpdated: string;
  source: "live" | "fallback";
  error?: string;
}

// Fixed timezone keeps server and client render identical (no hydration warning).
function formatUpdated(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Halifax",
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function BeachWatchClient({
  beaches,
  lastUpdated,
  source,
  error,
}: Props) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return beaches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q)
    );
  }, [query, beaches]);

  const updatedAt = formatUpdated(lastUpdated);

  return (
    <main className="min-h-screen pb-16">
      <Header />

      <div className="mb-4">
        <SearchBar
          beaches={beaches}
          query={query}
          onQueryChange={setQuery}
          results={results}
          onSelect={(b) => {
            setSelectedId(b.id);
            setQuery("");
          }}
        />
      </div>

      {/* Map + legend */}
      <section className="mx-auto max-w-5xl px-4">
        <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <Legend />
            <span className="text-xs text-ink-soft">
              {source === "fallback" ? "Showing saved data, updated " : "Updated "}
              {updatedAt}
            </span>
          </div>
          <div className="h-[380px] w-full sm:h-[520px]">
            <BeachMap
              beaches={beaches}
              selectedId={selectedId}
              onSelect={(b) => setSelectedId(b.id)}
            />
          </div>
        </div>
        <p className="mt-2 px-1 text-xs text-ink-soft">
          Tip: click a dot for details, or search a beach above to jump to it.
          Data from the City of Halifax, refreshed daily.
        </p>
        {source === "fallback" && error && (
          <p className="mt-1 px-1 text-xs text-risk">
            Live update did not go through, so this may not be today&apos;s
            result.
          </p>
        )}
      </section>

      <div className="mt-10">
        <StatsBar beaches={beaches} />
      </div>
    </main>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
      {(["open", "closed", "risk", "offseason"] as const).map((s) => (
        <span key={s} className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded-full ring-2 ring-white"
            style={{ background: STATUS_META[s].color }}
          />
          <span className="font-medium text-ink">{STATUS_META[s].label}</span>
        </span>
      ))}
    </div>
  );
}
