import { describe, expect, it, vi } from "vitest";
import { FlowClientError, TheiaFlowClient } from "./index.js";

describe("TheiaFlowClient", () => {
  it("rejects non-http server URLs", () => {
    expect(
      () => new TheiaFlowClient({ apiBaseUrl: "file:///tmp/flow", apiKey: "test" }),
    ).toThrow(FlowClientError);
  });

  it("uses upstream board identity and accessible-company APIs", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json({
          userId: "user-1",
          user: { id: "user-1", email: "operator@example.test", name: "Operator" },
          isInstanceAdmin: false,
          companyIds: ["company-1"],
          source: "board_key",
          keyId: "key-1",
        }),
      )
      .mockResolvedValueOnce(
        Response.json([{ id: "company-1", name: "Theia", issuePrefix: "THIA" }]),
      );

    const client = new TheiaFlowClient({
      apiBaseUrl: "https://flow.example.test/",
      apiKey: "pcp_board_test",
      fetchImpl,
    });

    await client.whoAmI();
    await client.listCompanies();

    expect(fetchImpl.mock.calls[0]?.[0]).toBe("https://flow.example.test/api/cli-auth/me");
    expect(fetchImpl.mock.calls[1]?.[0]).toBe(
      "https://flow.example.test/api/companies?scope=accessible",
    );
    const firstHeaders = new Headers(fetchImpl.mock.calls[0]?.[1]?.headers);
    expect(firstHeaders.get("authorization")).toBe("Bearer pcp_board_test");
  });

  it("does not expose the API key as a public field", () => {
    const client = new TheiaFlowClient({
      apiBaseUrl: "https://flow.example.test",
      apiKey: "secret",
    });
    expect(Object.keys(client)).not.toContain("apiKey");
  });
});
