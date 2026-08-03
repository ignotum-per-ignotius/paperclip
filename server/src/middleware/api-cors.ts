import type { RequestHandler } from "express";

const DEFAULT_ALLOW_HEADERS = [
  "Authorization",
  "Content-Type",
  "Prefer",
  "X-Paperclip-Run-Id",
  "X-Requested-With",
].join(", ");

const DEFAULT_ALLOW_METHODS = "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS";

function parseOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Parse `PAPERCLIP_API_CORS_ORIGINS` (comma-separated absolute origins).
 * Empty / unset → no CORS headers (same-origin / non-browser clients only).
 * A bare `*` allowlists any Origin (dev/embed convenience; do not use in
 * untrusted multi-tenant production).
 */
export function parseApiCorsOrigins(raw: string | undefined): string[] | "*" | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  if (trimmed === "*") return "*";

  const origins: string[] = [];
  for (const part of trimmed.split(",")) {
    const origin = parseOrigin(part.trim());
    if (origin) origins.push(origin);
  }
  return origins.length > 0 ? origins : null;
}

export function isOriginAllowed(
  originHeader: string | undefined,
  allowlist: string[] | "*" | null,
): string | null {
  if (!allowlist) return null;
  const origin = parseOrigin(originHeader);
  if (!origin) return null;
  if (allowlist === "*") return origin;
  return allowlist.includes(origin) ? origin : null;
}

/**
 * Browser CORS for inbound control-plane clients (e.g. BIZEVAL's
 * "Connect Paperclip" form) that call `/api` with a board bearer key from
 * another origin.
 *
 * Controlled by `PAPERCLIP_API_CORS_ORIGINS`. When unset, behavior matches
 * historical Paperclip (no ACAO headers).
 */
export function apiCorsMiddleware(
  envValue: string | undefined = process.env.PAPERCLIP_API_CORS_ORIGINS,
): RequestHandler {
  const allowlist = parseApiCorsOrigins(envValue);

  return (req, res, next) => {
    if (!allowlist) {
      next();
      return;
    }

    const allowedOrigin = isOriginAllowed(req.header("origin"), allowlist);
    if (allowedOrigin) {
      res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", DEFAULT_ALLOW_METHODS);
      res.setHeader("Access-Control-Allow-Headers", DEFAULT_ALLOW_HEADERS);
      res.setHeader("Access-Control-Max-Age", "86400");
      res.setHeader("Access-Control-Expose-Headers", "Content-Type");
    }

    if (req.method.toUpperCase() === "OPTIONS") {
      if (allowedOrigin || allowlist === "*") {
        res.status(204).end();
        return;
      }
      // No matching Origin — fall through so the request is not silently OK'd.
    }

    next();
  };
}
