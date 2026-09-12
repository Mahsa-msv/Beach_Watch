import "server-only";
import twilio from "twilio";

export interface SendResult {
  ok: boolean;
  error?: string;
  id?: string;
}

/**
 * Send an SMS via Twilio. Server-side only ("server-only" guards against any
 * accidental client import, so the auth token never reaches the browser).
 * Never throws: returns { ok:false, error } so callers can surface it in the UI.
 */
export async function sendSmsAlert(
  to: string,
  message: string
): Promise<SendResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) {
    return {
      ok: false,
      error:
        "Twilio is not configured (set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER).",
    };
  }
  if (!to) {
    return { ok: false, error: "No destination phone number provided." };
  }

  try {
    const client = twilio(sid, token);
    const res = await client.messages.create({ to, from, body: message });
    return { ok: true, id: res.sid };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[sms] Twilio send failed: ${msg}`);
    return { ok: false, error: msg };
  }
}
