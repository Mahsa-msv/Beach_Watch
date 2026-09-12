import type { Beach } from "@/lib/types";
import { STATUS_META } from "@/lib/types";

export default function BeachPopup({ beach }: { beach: Beach }) {
  const meta = STATUS_META[beach.status];
  const needsReason = beach.status !== "open";

  return (
    <div className="w-64 p-3 font-body">
      <h3 className="text-base font-bold leading-tight text-ink">{beach.name}</h3>
      <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {beach.location}
      </p>

      {/* Status badge */}
      <div
        className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
        style={{ background: meta.tint, color: meta.color }}
      >
        <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
        {meta.label}
      </div>

      {/* Reason — only when closed / at risk */}
      {needsReason && beach.reason && (
        <p
          className="mt-2 rounded-lg px-2.5 py-2 text-xs leading-snug"
          style={{ background: meta.tint, color: "var(--ink)" }}
        >
          <span className="font-semibold">Why: </span>
          {beach.reason}
        </p>
      )}

      {/* Details */}
      <dl className="mt-2 space-y-1.5 text-xs">
        <Row label="Water quality" value={beach.waterQuality} />
        <Row label="Lifeguard supervision" value={beach.lifeguardSupervision} />
        <Row label="Water type" value={beach.waterType} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-ink-soft">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
