# Beach Watch

**Live app: https://beach-watch-plum.vercel.app/**

Is the beach open? A responsive web app that shows the status of Halifax (HRM)
supervised beaches, so a parent or dog owner can check before they drive.

Built with Next.js (App Router) + TypeScript + Tailwind CSS, with a Leaflet map
on free OpenStreetMap tiles (no API key).

## Requirements

- Node.js 18.17 or newer (built and tested on Node 18 and Node 20)
- npm 10 or newer

## Run it locally

From this folder:

```bash
npm install
npm run dev
```

Then open http://localhost:3000

To build and run a production version:

```bash
npm run build
npm start
```

## What is on the page

- "Beach Watch" header
- Search box that filters beaches by name or lake, plus a notification bell
  (Email or Phone alerts, with a multi select list of beaches to watch)
- Interactive HRM map with color coded dots (green open, red closed, orange high
  risk), and a popup per beach with name, location, status, reason (when closed
  or at risk), water quality, lifeguard supervision, and water type
- A statistics row: number open, closed, and at risk

## Where things live

| File | Purpose |
| --- | --- |
| `app/page.tsx` | Composes the page and holds search + selection state |
| `app/layout.tsx` | Root layout, fonts, page metadata |
| `app/globals.css` | Theme tokens (colors, fonts, radius, shadow) — the place to restyle |
| `components/Header.tsx` | Title bar |
| `components/SearchBar.tsx` | Search box, results dropdown, notification popover |
| `components/BeachMap.tsx` | Leaflet map with status dots (client only) |
| `components/BeachPopup.tsx` | Popup contents for a beach |
| `components/StatsBar.tsx` | Open / closed / at risk counts |
| `lib/types.ts` | `Beach` type and the status to color/label map |
| `lib/beaches.ts` | Beach data |

## Change the look

All colors and fonts are CSS variables in one place:

- `app/globals.css` for colors, card radius, and shadow
- `app/layout.tsx` to swap the fonts (Poppins headings, Inter body)

Edit a value, save, and the dev server hot reloads.

## Data status

The beach names, locations, lifeguard supervision, and water type reflect the real
19 supervised HRM beaches. Wiring the live daily data from the
City of Halifax page is an implemented step (a server side fetch with 24 hour
revalidation and an API route).
