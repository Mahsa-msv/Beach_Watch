import "server-only";
import sgMail from "@sendgrid/mail";
import type { SendResult } from "./sms";

/**
 * Send an email via SendGrid (Twilio's email platform). Server-side only.
 * Never throws: returns { ok:false, error } so callers can surface it in the UI.
 */
export async function sendEmailAlert(
  to: string,
  subject: string,
  message: string
): Promise<SendResult> {
  const key = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL;

  if (!key || !from) {
    return {
      ok: false,
      error:
        "SendGrid is not configured (set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL).",
    };
  }
  if (!to) {
    return { ok: false, error: "No destination email provided." };
  }

  try {
    sgMail.setApiKey(key);
    const [res] = await sgMail.send({ to, from, subject, text: message });
    return { ok: true, id: res.headers["x-message-id"] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[email] SendGrid send failed: ${msg}`);
    return { ok: false, error: msg };
  }
}
