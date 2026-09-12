import { getBeachData } from "@/lib/beachData";

// Re-fetch and re-parse at most once per day. Next.js handles the schedule, so
// no external cron is needed. A monitoring tool or the client can GET this route.
export const revalidate = 86400;

export async function GET() {
  const data = await getBeachData();
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
