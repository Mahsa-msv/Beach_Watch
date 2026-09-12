// Single source of truth for beach status, its colors, and labels.
// Reused by the map dots, popups, stats, and legend.

// open / closed / risk are the in-season states shown on the Halifax page.
// offseason covers "Supervision ended for the season"; unknown is a safety net
// for any status text we cannot classify. Colors live in app/globals.css.
export type BeachStatus = "open" | "closed" | "risk" | "offseason" | "unknown";

export interface Beach {
  id: string;
  name: string;
  location: string; // e.g. "Chocolate Lake, Halifax"
  lat: number;
  lng: number;
  status: BeachStatus;
  rawStatus?: string; // exact status text parsed from the Halifax page
  reason?: string; // shown only when closed or at risk
  waterQuality: string; // e.g. "E. coli 10 CFU/100mL (within guideline)"
  lifeguardSupervision: string; // e.g. "July 1 to September 1"
  waterType: string; // e.g. "Fresh water"
}

// The result returned by the live data function and the API route.
export interface BeachData {
  beaches: Beach[];
  lastUpdated: string; // ISO timestamp of when this data was fetched
  source: "live" | "fallback"; // live = parsed from Halifax; fallback = cache/sample
  error?: string; // populated when a fetch or parse failed and we fell back
}

interface StatusMeta {
  label: string;
  /** CSS variable so map/badges match the theme exactly. */
  color: string;
  tint: string;
  short: string;
}

export const STATUS_META: Record<BeachStatus, StatusMeta> = {
  open: {
    label: "Open",
    color: "var(--status-open)",
    tint: "rgba(47, 174, 102, 0.14)",
    short: "Open",
  },
  closed: {
    label: "Closed",
    color: "var(--status-closed)",
    tint: "rgba(224, 72, 61, 0.14)",
    short: "Closed",
  },
  risk: {
    label: "High risk advisory in effect",
    color: "var(--status-risk)",
    tint: "rgba(240, 147, 43, 0.16)",
    short: "At risk",
  },
  offseason: {
    label: "Supervision ended for the season",
    color: "var(--status-offseason)",
    tint: "rgba(120, 144, 156, 0.16)",
    short: "Off-season",
  },
  unknown: {
    label: "Status unavailable",
    color: "var(--status-offseason)",
    tint: "rgba(120, 144, 156, 0.16)",
    short: "Unknown",
  },
};
