import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { getBeachData, getCachedBeachData } from "@/lib/beachData";
import { sendSmsAlert } from "@/lib/sms";
import { sendEmailAlert } from "@/lib/email";
import { STATUS_META } from "@/lib/types";
import type { Beach } from "@/lib/types";

// Always run fresh; never cache the cron endpoint itself.
export const dynamic = "force-dynamic";

function isAlertable(b: Beach): boolean {
  return b.status === "closed" || b.status === "risk";
}

/**
 * Triggered by Vercel Cron (see vercel.json) shortly after the City of Halifax
 * posts the morning results. It invalidates the cached beach fetch and re-warms
 * it, so the site shows the new day's data without waiting for a visitor.
 *
 * Optional auto-alerts: it diffs the fresh data against the previous cache and,
 * for any beach that newly became a closure/advisory, sends an SMS/email to the
 * DEMO_PHONE / DEMO_EMAIL recipient. Best-effort: the previous snapshot lives in
 * process memory, so on a cold serverless instance there is nothing to diff
 * against (a production version would store subscribers + last state in a DB).
 *
 * If CRON_SECRET is set, Vercel Cron sends it as a Bearer token and we require
 * it. If it is not set, the endpoint stays open (handy before the env is added).
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const previous = getCachedBeachData();
  revalidateTag("beach-data");
  const data = await getBeachData(); // re-fetch now so the cache is warm

  // Detect beaches that newly became a closure/advisory since the last check.
  const alerts: string[] = [];
  if (previous) {
    const prevById = new Map(previous.beaches.map((b) => [b.id, b]));
    for (const beach of data.beaches) {
      const before = prevById.get(beach.id);
      if (before && !isAlertable(before) && isAlertable(beach)) {
        alerts.push(`Beach Watch alert: ${beach.name} - ${STATUS_META[beach.status].label}`);
      }
    }
  }

  // Send any change alerts to the demo recipient(s), if configured.
  const phone = (process.env.DEMO_PHONE || "").trim();
  const email = (process.env.DEMO_EMAIL || "").trim();
  const sendResults: Array<{ message: string; sms?: unknown; email?: unknown }> =
    [];
  for (const message of alerts) {
    sendResults.push({
      message,
      sms: phone ? await sendSmsAlert(phone, message) : undefined,
      email: email
        ? await sendEmailAlert(email, "Beach Watch alert", message)
        : undefined,
    });
  }

  return Response.json({
    revalidated: true,
    at: new Date().toISOString(),
    source: data.source,
    count: data.beaches.length,
    lastUpdated: data.lastUpdated,
    changedToAlert: alerts.length,
    sendResults,
  });
}
