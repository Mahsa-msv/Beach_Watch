import BeachWatchClient from "@/components/BeachWatchClient";
import { getBeachData } from "@/lib/beachData";

// Re-fetch and re-parse the Halifax page at most once per day. Next.js handles
// the schedule on the next request after this window, so there is no cron job.
export const revalidate = 86400;

export default async function Home() {
  const data = await getBeachData();
  return (
    <BeachWatchClient
      beaches={data.beaches}
      lastUpdated={data.lastUpdated}
      source={data.source}
      error={data.error}
    />
  );
}
