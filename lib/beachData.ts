import * as cheerio from "cheerio";
import type { Beach, BeachData, BeachStatus } from "./types";
import { BEACH_COORDS, HRM_FALLBACK_COORD } from "./beachCoords";
import { BEACHES as SAMPLE_BEACHES } from "./beaches";

// The public Halifax page that lists supervised beach statuses.
export const SOURCE_URL =
  "https://www.halifax.ca/parks-recreation/programs-activities/swimming/supervised-beaches-outdoor-pools-splash-pads";

// A browser-like User-Agent is required: the site returns 403 to the default
// fetch agent. This is the whole reason a plain fetch appeared "blocked" before.
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";

// Refresh once per day. Next.js re-runs the fetch when a request arrives after
// this window, so no external scheduler is needed.
const REVALIDATE_SECONDS = 86400;

// In-memory cache of the last successful parse, used as a fallback if a later
// fetch or parse fails. This lives for the life of the server process.
let lastGood: BeachData | null = null;

// The last successfully parsed data, if any, without triggering a fetch.
// Used to diff against a fresh fetch to detect status changes.
export function getCachedBeachData(): BeachData | null {
  return lastGood;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Classify the raw status text into a color bucket, without losing the original
// text. We never invent a status: anything unclassifiable becomes "unknown".
function deriveStatus(rawStatus: string): BeachStatus {
  const s = rawStatus.toLowerCase();
  if (s.includes("closed")) return "closed";
  if (s.includes("advisory") || s.includes("risk")) return "risk";
  if (s.includes("supervision ended") || s.includes("season")) return "offseason";
  if (s.includes("open")) return "open";
  return "unknown";
}

// Parse the "Supervised Beaches" table out of the page HTML.
function parseBeaches(htmlText: string): Beach[] {
  const $ = cheerio.load(htmlText);

  // Find the table whose header row includes "Beach Name".
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tableEl: any = null;
  $("table").each((_, el) => {
    const headerText = $(el).find("tr").first().text().toLowerCase();
    if (headerText.includes("beach name")) {
      tableEl = el;
      return false; // stop at the first match
    }
  });

  if (!tableEl) {
    throw new Error("Supervised Beaches table not found on the page");
  }

  const beaches: Beach[] = [];

  for (const row of $(tableEl).find("tr").toArray()) {
    const cells = $(row)
      .find("td")
      .toArray()
      .map((td) => $(td).text().replace(/\s+/g, " ").trim());

    // Data rows have the 6 columns; header/other rows use <th> and are skipped.
    if (cells.length < 6) continue;

    const [name, location, lifeguard, waterType, sampleResults, statusText] =
      cells;

    if (!name) continue;
    // Some tables put the header in <td> cells; skip that row.
    if (name.toLowerCase() === "beach name") continue;

    const id = slugify(name);
    const status = deriveStatus(statusText);
    const coord = BEACH_COORDS[id] ?? HRM_FALLBACK_COORD;
    if (!BEACH_COORDS[id]) {
      console.warn(
        `[beachData] No coordinates for "${name}" (${id}); placed at HRM center. Add it to lib/beachCoords.ts.`
      );
    }

    beaches.push({
      id,
      name,
      location,
      lat: coord.lat,
      lng: coord.lng,
      status,
      rawStatus: statusText,
      // Only closures and advisories carry a reason; the page states it in the
      // status text itself, so surface that text as the reason.
      reason:
        status === "closed" || status === "risk" ? statusText : undefined,
      waterQuality: sampleResults || "N/A",
      lifeguardSupervision: lifeguard || "",
      waterType: waterType || "",
    });
  }

  if (beaches.length === 0) {
    throw new Error("Supervised Beaches table had no readable rows");
  }

  return beaches;
}

/**
 * Fetch and parse live beach data from the City of Halifax.
 *
 * Never throws. On any fetch or parse failure it falls back to the last good
 * result if we have one, otherwise to the built-in sample data, and reports
 * that in `source` and `error` so the caller/UI can react.
 */
export async function getBeachData(): Promise<BeachData> {
  try {
    const res = await fetch(SOURCE_URL, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-CA,en;q=0.9",
      },
      next: { revalidate: REVALIDATE_SECONDS, tags: ["beach-data"] },
    });

    if (!res.ok) {
      throw new Error(`Halifax page returned HTTP ${res.status}`);
    }

    const htmlText = await res.text();
    const beaches = parseBeaches(htmlText);

    const data: BeachData = {
      beaches,
      lastUpdated: new Date().toISOString(),
      source: "live",
    };
    lastGood = data;
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[beachData] Live fetch/parse failed: ${message}`);

    if (lastGood) {
      return { ...lastGood, source: "fallback", error: message };
    }

    // No prior success this process: fall back to the built-in sample data so
    // the page still renders. Sample rows carry rawStatus mirroring status.
    return {
      beaches: SAMPLE_BEACHES.map((b) => ({
        ...b,
        rawStatus: b.rawStatus ?? b.status,
      })),
      lastUpdated: new Date().toISOString(),
      source: "fallback",
      error: message,
    };
  }
}
