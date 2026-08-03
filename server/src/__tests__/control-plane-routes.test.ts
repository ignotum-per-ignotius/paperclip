import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockBoardAuthService = vi.hoisted(() => ({
  resolveBoardAccess: vi.fn(),
}));

vi.mock("../services/index.js", () => ({
  boardAuthService: () => mockBoardAuthService,
}));

vi.mock("../version.js", () => ({
  serverVersion: "test-version",
}));

describe("control-plane connect route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function createApp(actor: Record<string, unknown>, db: unknown) {
    const { controlPlaneRoutes } = await import("../routes/control-plane.js");
    const { errorHandler } = await import("../middleware/error-handler.js");
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
      req.actor = actor as typeof req.actor;
      next();
    });
    app.use("/api/control-plane", controlPlaneRoutes(db as never));
    app.use(errorHandler);
    return app;
  }

  it("rejects non-board actors", async () => {
    const app = await createApp({ type: "agent", agentId: "a1" }, {});
    const res = await request(app).get("/api/control-plane/connect");
    expect(res.status).toBe(401);
  });

  it("returns companies for a board API key", async () => {
    mockBoardAuthService.resolveBoardAccess.mockResolvedValue({
      user: { id: "user-1", name: "Vince", email: "vince@example.com" },
      companyIds: ["co-1"],
      memberships: [{ companyId: "co-1", membershipRole: "admin", status: "active" }],
      isInstanceAdmin: false,
    });

    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { id: "co-1", name: "IT Division", issuePrefix: "IT" },
          ]),
        }),
      }),
    };

    const app = await createApp(
      {
        type: "board",
        userId: "user-1",
        source: "board_key",
        keyId: "key-1",
        companyIds: ["co-1"],
      },
      db,
    );

    const res = await request(app).get("/api/control-plane/connect");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      controlPlane: "paperclip",
      version: "test-version",
      actor: {
        userId: "user-1",
        source: "board_key",
        keyId: "key-1",
        isInstanceAdmin: false,
      },
      companies: [{ id: "co-1", name: "IT Division", issuePrefix: "IT" }],
    });
  });
});
