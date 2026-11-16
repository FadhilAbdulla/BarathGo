import { site } from "./site";

export type SubmitKind = "ride" | "driver" | "business" | "contact";
export type SubmitResult = { kind: "sent" } | { kind: "error"; message: string } | { kind: "mailto" };

const toLabel = (key: string) => key.replace(/[-_]/g, " ").replace(/^./, (letter) => letter.toUpperCase());

/**
 * Posts a form to /api/request (Cloudflare Worker → email to the BarathGo team).
 * If the endpoint is unavailable (e.g. local `next dev`, or email not configured yet),
 * it opens the visitor's email app with the details filled in instead.
 */
export async function submitRequest(kind: SubmitKind, subject: string, values: Record<string, string>): Promise<SubmitResult> {
  try {
    const response = await fetch("/api/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, kind }),
    });
    if (response.ok) return { kind: "sent" };
    if (response.status === 400 || response.status === 429) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      return { kind: "error", message: data.error ?? "Please check the form and try again." };
    }
    throw new Error(`Unexpected status ${response.status}`);
  } catch {
    const { website: _honeypot, ...rest } = values;
    const body = Object.entries(rest)
      .filter(([, value]) => value)
      .map(([key, value]) => `${toLabel(key)}: ${value}`)
      .join("\n");
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return { kind: "mailto" };
  }
}
