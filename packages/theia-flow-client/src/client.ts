import {
  FlowClientError,
  type FlowAgent,
  type FlowBoardIdentity,
  type FlowCompany,
  type FlowHealth,
  type FlowIssue,
  type FlowIssueFilters,
  type FlowOrgNode,
} from "./types.js";

export type TheiaFlowClientOptions = {
  apiBaseUrl: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
};

function normalizeApiBase(apiBaseUrl: string): string {
  const trimmed = apiBaseUrl.trim().replace(/\/+$/, "");
  if (!trimmed) throw new FlowClientError(400, "Flow server URL is required");

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new FlowClientError(400, "Flow server URL must be an absolute URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new FlowClientError(400, "Flow server URL must use http or https");
  }

  return trimmed;
}

/**
 * Server-to-server client used by Theia to control Theia Flow.
 *
 * The API key is intentionally never persisted by this package. The host
 * application must provide it from server-side secret storage for each client
 * instance. Browser use is not supported.
 */
export class TheiaFlowClient {
  readonly apiBaseUrl: string;
  readonly #apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: TheiaFlowClientOptions) {
    this.apiBaseUrl = normalizeApiBase(opts.apiBaseUrl);
    this.#apiKey = opts.apiKey.trim();
    if (!this.#apiKey) throw new FlowClientError(400, "Flow API key is required");
    this.fetchImpl = opts.fetchImpl ?? fetch.bind(globalThis);
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = `${this.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${this.#apiKey}`);
    headers.set("Accept", "application/json");
    if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

    let response: Response;
    try {
      response = await this.fetchImpl(url, { ...init, headers });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new FlowClientError(0, `Failed to reach Theia Flow at ${this.apiBaseUrl}: ${message}`);
    }

    const text = await response.text();
    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }

    if (!response.ok) {
      const message =
        typeof body === "object" && body && "error" in body
          ? String((body as { error: unknown }).error)
          : `Theia Flow request failed (${response.status})`;
      throw new FlowClientError(response.status, message, body);
    }

    return body as T;
  }

  health(): Promise<FlowHealth> {
    return this.request<FlowHealth>("/api/health");
  }

  whoAmI(): Promise<FlowBoardIdentity> {
    return this.request<FlowBoardIdentity>("/api/cli-auth/me");
  }

  listCompanies(): Promise<FlowCompany[]> {
    return this.request<FlowCompany[]>("/api/companies?scope=accessible");
  }

  getCompany(companyId: string): Promise<FlowCompany> {
    return this.request<FlowCompany>(`/api/companies/${encodeURIComponent(companyId)}`);
  }

  listAgents(companyId: string): Promise<FlowAgent[]> {
    return this.request<FlowAgent[]>(`/api/companies/${encodeURIComponent(companyId)}/agents`);
  }

  getOrg(companyId: string): Promise<FlowOrgNode[]> {
    return this.request<FlowOrgNode[]>(`/api/companies/${encodeURIComponent(companyId)}/org`);
  }

  listIssues(companyId: string, filters: FlowIssueFilters = {}): Promise<FlowIssue[]> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
    }
    const query = params.toString();
    return this.request<FlowIssue[]>(
      `/api/companies/${encodeURIComponent(companyId)}/issues${query ? `?${query}` : ""}`,
    );
  }

  requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
    return this.request<T>(path, init);
  }
}
