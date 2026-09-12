// Approximate coordinates for HRM supervised beaches.
//
// The Halifax page does not publish lat/lng, so we merge the parsed rows with
// this lookup to place dots on the map. Keys are the slug of the beach name
// (see slugify in lib/beachData.ts). Coordinates are approximate, chosen to sit
// on the correct lake or shore. Add a new entry here if Halifax adds a beach.

export const BEACH_COORDS: Record<string, { lat: number; lng: number }> = {
  "albro-lake-beach": { lat: 44.682, lng: -63.568 },
  "birch-cove-beach": { lat: 44.683, lng: -63.572 },
  "campbell-point-beach": { lat: 44.596, lng: -63.702 },
  "chocolate-lake-beach": { lat: 44.636, lng: -63.61 },
  "cunard-pond-beach": { lat: 44.61, lng: -63.592 },
  "kearney-lake-beach": { lat: 44.69, lng: -63.672 },
  "kidston-lake-beach": { lat: 44.618, lng: -63.641 },
  "kinap-beach": { lat: 44.715, lng: -63.298 },
  "lake-echo-beach": { lat: 44.728, lng: -63.382 },
  "long-pond-beach": { lat: 44.63, lng: -63.618 },
  "oakfield-park-beach": { lat: 44.905, lng: -63.488 },
  "penhorn-lake-beach": { lat: 44.666, lng: -63.532 },
  "pleasant-drive-beach": { lat: 44.79, lng: -63.15 },
  "sandy-lake-beach": { lat: 44.735, lng: -63.665 },
  "saunders-beach": { lat: 44.724, lng: -63.659 },
  "shubie-park-beach": { lat: 44.733, lng: -63.545 },
  "springfield-beach": { lat: 44.776, lng: -63.705 },
  "taylor-head-beach": { lat: 44.813, lng: -62.575 },
};

// Fallback center (roughly HRM) for any beach we do not yet have coordinates for.
export const HRM_FALLBACK_COORD = { lat: 44.7, lng: -63.58 };
