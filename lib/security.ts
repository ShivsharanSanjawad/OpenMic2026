import sanitizeHtml from "sanitize-html";
import { NextRequest } from "next/server";

export function sanitizeText(value: unknown, maxLength = 500) {
  const clean = sanitizeHtml(String(value ?? ""), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/[<>`]/g, "")
    .trim();
  return clean.slice(0, maxLength);
}

export function sanitizePhone(value: string) {
  return value.replace(/[^0-9]/g, "").slice(0, 10);
}

export function sanitizeJsonInput<T>(input: T): T {
  if (typeof input === "string") return sanitizeText(input, 4000) as T;
  if (Array.isArray(input)) return input.map((item) => sanitizeJsonInput(item)) as T;
  if (input && typeof input === "object") {
    const obj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      obj[sanitizeText(key, 80)] = sanitizeJsonInput(value);
    }
    return obj as T;
  }
  return input;
}

export function assertAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const extraAllowed = process.env.ALLOWED_ORIGINS;

  if (!origin) return false;

  try {
    const reqOrigin = new URL(origin).origin;

    const allowedOrigins = new Set<string>();
    if (appUrl) allowedOrigins.add(new URL(appUrl).origin);
    allowedOrigins.add(request.nextUrl.origin);

    if (extraAllowed) {
      for (const item of extraAllowed.split(",")) {
        const value = item.trim();
        if (value) {
          try {
            allowedOrigins.add(new URL(value).origin);
          } catch {
            // Ignore malformed extra origins
          }
        }
      }
    }

    if (process.env.NODE_ENV !== "production") {
      allowedOrigins.add("http://localhost:3000");
      allowedOrigins.add("http://127.0.0.1:3000");
    }

    return allowedOrigins.has(reqOrigin);
  } catch {
    return false;
  }
}

export function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export function secureHeaders(nonce?: string) {
  const isProd = process.env.NODE_ENV === "production";

  // Use nonce + strict-dynamic in production for tight CSP without unsafe-inline.
  // 'strict-dynamic' lets scripts loaded by a nonced script load further scripts,
  // which is required for Next.js chunk loading.
  const scriptSrc = nonce
    ? `script-src 'nonce-${nonce}' 'strict-dynamic'`
    : isProd
      ? "script-src 'self'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

  const connectSrc = isProd
    ? "connect-src 'self' https://api.cloudinary.com"
    : "connect-src 'self' https://api.cloudinary.com ws://localhost:* http://localhost:*";

  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-DNS-Prefetch-Control": "off",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Content-Security-Policy": [
      "default-src 'self'",
      "img-src 'self' data: https://res.cloudinary.com",
      "media-src 'self' https://res.cloudinary.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      scriptSrc,
      connectSrc,
      "frame-src https://www.youtube.com",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ].join("; "),
  };
}
