import { afterEach, describe, expect, it } from "vitest";
import express from "express";
import request from "supertest";
import {
  apiCorsMiddleware,
  isOriginAllowed,
  parseApiCorsOrigins,
} from "../middleware/api-cors.js";

describe("parseApiCorsOrigins", () => {
  it("returns null for empty input", () => {
    expect(parseApiCorsOrigins(undefined)).toBeNull();
    expect(parseApiCorsOrigins("")).toBeNull();
    expect(parseApiCorsOrigins("   ")).toBeNull();
  });

  it("parses a comma-separated allowlist", () => {
    expect(parseApiCorsOrigins("https://bizeval.example, http://localhost:5173")).toEqual([
      "https://bizeval.example",
      "http://localhost:5173",
    ]);
  });

  it("accepts wildcard allow-all", () => {
    expect(parseApiCorsOrigins("*")).toBe("*");
  });
});

describe("isOriginAllowed", () => {
  it("rejects when no allowlist is configured", () => {
    expect(isOriginAllowed("https://bizeval.example", null)).toBeNull();
  });

  it("matches an allowlisted origin case-insensitively on host", () => {
    expect(
      isOriginAllowed("https://BIZEVAL.example", ["https://bizeval.example"]),
    ).toBe("https://bizeval.example");
  });

  it("reflects any origin when allowlist is *", () => {
    expect(isOriginAllowed("https://app.example", "*")).toBe("https://app.example");
  });
});

describe("apiCorsMiddleware", () => {
  afterEach(() => {
    delete process.env.PAPERCLIP_API_CORS_ORIGINS;
  });

  function createApp(envValue?: string) {
    const app = express();
    app.use("/api", apiCorsMiddleware(envValue));
    app.get("/api/health", (_req, res) => {
      res.json({ ok: true });
    });
    return app;
  }

  it("does not set CORS headers when unset", async () => {
    const res = await request(createApp(undefined))
      .get("/api/health")
      .set("Origin", "https://bizeval.example");
    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("reflects an allowlisted Origin and answers preflight", async () => {
    const app = createApp("https://bizeval.example");
    const preflight = await request(app)
      .options("/api/health")
      .set("Origin", "https://bizeval.example")
      .set("Access-Control-Request-Method", "GET")
      .set("Access-Control-Request-Headers", "authorization");
    expect(preflight.status).toBe(204);
    expect(preflight.headers["access-control-allow-origin"]).toBe("https://bizeval.example");
    expect(preflight.headers["access-control-allow-headers"]).toMatch(/Authorization/i);

    const get = await request(app)
      .get("/api/health")
      .set("Origin", "https://bizeval.example");
    expect(get.status).toBe(200);
    expect(get.headers["access-control-allow-origin"]).toBe("https://bizeval.example");
  });

  it("does not reflect a non-allowlisted Origin", async () => {
    const res = await request(createApp("https://bizeval.example"))
      .get("/api/health")
      .set("Origin", "https://evil.example");
    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
