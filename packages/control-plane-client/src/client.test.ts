import { describe, expect, it, vi } from "vitest";
import { PaperclipControlPlaneClient } from "./client.js";
import { PaperclipControlPlaneError } from "./types.js";

describe("PaperclipControlPlaneClient", () => {
  it("normalizes trailing slashes on the API base", () => {
    const client = new PaperclipControlPlaneClient({
      apiBaseUrl: "https://paperclip.example.com/",
      apiKey: "pcp_board_test",
      fetchImpl: vi.fn(),
    });
    expect(client.apiBaseUrl).toBe("https://paperclip.example.com");
  });

  it("rejects non-http server URLs", () => {
    expect(
      () =>
        new PaperclipControlPlaneClient({
          apiBaseUrl: "localhost:3100",
          apiKey: "pcp_board_test",
        }),
    ).toThrow(/http or https/);
    expect(
      () =>
        new PaperclipControlPlaneClient({
          apiBaseUrl: "/relative",
          apiKey: "pcp_board_test",
        }),
    ).toThrow(PaperclipControlPlaneError);
  });

  it("calls /api/control-plane/connect with the board bearer key", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          ok: true,
          controlPlane: "paperclip",
          version: "0.3.1",
          actor: {
            userId: "u1",
            user: { id: "u1", name: "Vince", email: "vince@example.com" },
            isInstanceAdmin: true,
            source: "board_key",
            keyId: "k1",
          },
          companies: [{ id: "c1", name: "IT", issuePrefix: "IT" }],
        }),
    });

    const client = new PaperclipControlPlaneClient({
      apiBaseUrl: "https://paperclip.example.com",
      apiKey: "pcp_board_secret",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await client.connect();
    expect(result.companies[0]?.issuePrefix).toBe("IT");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://paperclip.example.com/api/control-plane/connect",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
    const headers = fetchImpl.mock.calls[0][1].headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer pcp_board_secret");
  });

  it("surfaces CORS/network failures with an actionable message", async () => {
    const client = new PaperclipControlPlaneClient({
      apiBaseUrl: "https://paperclip.example.com",
      apiKey: "pcp_board_secret",
      fetchImpl: vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    });

    await expect(client.connect()).rejects.toMatchObject({
      name: "PaperclipControlPlaneError",
      message: expect.stringContaining("PAPERCLIP_API_CORS_ORIGINS"),
    });
  });

  it("builds board deep links", () => {
    const client = new PaperclipControlPlaneClient({
      apiBaseUrl: "https://paperclip.example.com",
      apiKey: "pcp_board_secret",
      fetchImpl: vi.fn(),
    });
    expect(client.openCompanyUrl({ issuePrefix: "IT" })).toBe("https://paperclip.example.com/IT");
    expect(client.openIssueUrl("IT", "IT-12")).toBe("https://paperclip.example.com/IT/issues/IT-12");
    expect(client.openAgentUrl("IT", "ceo")).toBe("https://paperclip.example.com/IT/agents/ceo");
  });
});
