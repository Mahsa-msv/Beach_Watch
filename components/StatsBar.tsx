import type { Beach } from "@/lib/types";
import { STATUS_META } from "@/lib/types";

export default function StatsBar({ beaches }: { beaches: Beach[] }) {
  const open = beaches.filter((b) => b.status === "open").length;
  const closed = beaches.filter((b) => b.status === "closed").length;
  const risk = beaches.filter((b) => b.status === "risk").length;
  // Off-season and any unclassified status both read as "Off-season" here.
  const offseason = beaches.filter(
    (b) => b.status === "offseason" || b.status === "unknown"
  ).length;

  const cards = [
    { label: "Open", value: open, meta: STATUS_META.open },
    { label: "Closed", value: closed, meta: STATUS_META.closed },
    { label: "At risk", value: risk, meta: STATUS_META.risk },
    { label: "Off-season", value: offseason, meta: STATUS_META.offseason },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4">
      <h2 className="mb-3 text-lg font-bold text-ink">Today across HRM</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="flex items-center gap-4 rounded-card border border-border bg-surface p-5 shadow-card"
          >
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold"
              style={{ background: c.meta.tint, color: c.meta.color }}
            >
              {c.value}
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{c.label}</p>
              <p className="text-xs text-ink-soft">
                {c.value === 1 ? "beach" : "beaches"} • {beaches.length} total
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
