import type { NextRequest } from "next/server";
import { getBeachData } from "@/lib/beachData";
import { sendSmsAlert } from "@/lib/sms";
import { sendEmailAlert } from "@/lib/email";
import { STATUS_META } from "@/lib/types";
import type { Beach } from "@/lib/types";

export const dynamic = "force-dynamic";

// A beach is "alertable" when it is closed or under a risk advisory.
function isAlertable(beach: Beach): boolean {
  return beach.status === "closed" || beach.status === "risk";
}

/**
 * POST /api/notify
 * Body (all optional):
 *   { phone?: string, email?: string, beachId?: string, mode?: "auto" | "test" }
 * - phone/email: recipients. Falls back to DEMO_PHONE / DEMO_EMAIL env if omitted.
 * - beachId: which beach to alert about; otherwise the first alertable beach, else the first beach.
 * - mode "auto" (default): only sends if the beach is under advisory/closure.
 * - mode "test": always sends, simulating an advisory when the beach is not alertable,
 *   so a text/email can be triggered live during the demo (it is off-season now).
 */
export async function POST(request: NextRequest) {
  let body: {
    phone?: string;
    email?: string;
    beachId?: string;
    mode?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    // no body is fine; demo defaults are used
  }

  const phone = (body.phone || process.env.DEMO_PHONE || "").trim();
  const email = (body.email || process.env.DEMO_EMAIL || "").trim();
  const mode = body.mode === "auto" ? "auto" : "test";

  if (!phone && !email) {
    return Response.json(
      {
        ok: false,
        error:
          "No phone or email provided, and no DEMO_PHONE / DEMO_EMAIL is set.",
      },
      { status: 400 }
    );
  }

  const data = await getBeachData();
  const beach =
    (body.beachId && data.beaches.find((b) => b.id === body.beachId)) ||
    data.beaches.find(isAlertable) ||
    data.beaches[0];

  if (!beach) {
    return Response.json(
      { ok: false, error: "No beach data available." },
      { status: 503 }
    );
  }

  // In auto mode, only alert on a real advisory/closure.
  if (mode === "auto" && !isAlertable(beach)) {
    return Response.json({
      ok: true,
      sent: false,
      reason: `${beach.name} is not under advisory or closure, so no alert was sent.`,
    });
  }

  // Build the message. In test mode with a non-alertable beach, simulate an
  // advisory so the demo message is meaningful (clearly labelled as a test).
  const statusLabel =
    mode === "test" && !isAlertable(beach)
      ? `${STATUS_META.risk.label} (test)`
      : STATUS_META[beach.status].label;
  const message = `Beach Watch alert: ${beach.name} - ${statusLabel}`;

  const sms = phone ? await sendSmsAlert(phone, message) : null;
  const emailRes = email
    ? await sendEmailAlert(email, "Beach Watch alert", message)
    : null;

  const errors = [sms?.error, emailRes?.error].filter(Boolean);
  const ok = (sms?.ok ?? true) && (emailRes?.ok ?? true);

  return Response.json(
    {
      ok,
      sent: ok,
      beach: beach.name,
      message,
      sms,
      email: emailRes,
      error: errors.length ? errors.join(" | ") : undefined,
    },
    { status: ok ? 200 : 502 }
  );
}
