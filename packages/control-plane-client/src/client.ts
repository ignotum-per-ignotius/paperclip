import {
  PaperclipControlPlaneError,
  type ControlPlaneAgent,
  type ControlPlaneConnectResult,
  type ControlPlaneHealth,
  type ControlPlaneIssue,
} from "./types.js";

export type PaperclipControlPlaneClientOptions = {
  apiBaseUrl: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
};

function normalizeApiBase(apiBaseUrl: string): string {
  const trimmed = apiBaseUrl.trim().replace(/\/+$/, "");
  if (!trimmed) throw new PaperclipControlPlaneError(400, "Paperclip server URL is required");
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new PaperclipControlPlaneError(400, "Paperclip server URL must be an absolute URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new PaperclipControlPlaneError(400, "Paperclip server URL must use http or https");
  }
  return trimmed;
}

export class PaperclipControlPlaneClient {
  readonly apiBaseUrl: string;
  readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: PaperclipControlPlaneClientOptions) {
    this.apiBaseUrl = normalizeApiBase(opts.apiBaseUrl);
    this.apiKey = opts.apiKey.trim();
    if (!this.apiKey) {
      throw new PaperclipControlPlaneError(400, "Paperclip API key is required");
    }
    this.fetchImpl = opts.fetchImpl ?? fetch.bind(globalThis);
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = `${this.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${this.apiKey}`);
    headers.set("Accept", "application/json");
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    let response: Response;
    try {
      response = await this.fetchImpl(url, { ...init, headers });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new PaperclipControlPlaneError(
        0,
        `Failed to reach Paperclip at ${this.apiBaseUrl}. Check the URL, CORS (PAPERCLIP_API_CORS_ORIGINS), and network. (${message})`,
      );
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
      const errorMessage =
        typeof body === "object" && body && "error" in body
          ? String((body as { error: unknown }).error)
          : `Paperclip request failed (${response.status})`;
      throw new PaperclipControlPlaneError(response.status, errorMessage, body);
    }

    return body as T;
  }

  health(): Promise<ControlPlaneHealth> {
    return this.request<ControlPlaneHealth>("/api/health");
  }

  /** One-shot connect verify used by BIZEVAL's Connect Paperclip button. */
  connect(): Promise<ControlPlaneConnectResult> {
    return this.request<ControlPlaneConnectResult>("/api/control-plane/connect");
  }

  listAgents(companyId: string): Promise<ControlPlaneAgent[]> {
    return this.request<ControlPlaneAgent[]>(`/api/companies/${encodeURIComponent(companyId)}/agents`);
  }

  listIssues(
    companyId: string,
    filters: { status?: string; limit?: number } = {},
  ): Promise<ControlPlaneIssue[]> {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.limit) params.set("limit", String(filters.limit));
    params.set("sortField", "updated");
    params.set("sortDir", "desc");
    const qs = params.toString();
    return this.request<ControlPlaneIssue[]>(
      `/api/companies/${encodeURIComponent(companyId)}/issues${qs ? `?${qs}` : ""}`,
    );
  }

  openCompanyUrl(company: { issuePrefix: string }): string {
    return `${this.apiBaseUrl}/${company.issuePrefix}`;
  }

  openIssueUrl(companyPrefix: string, identifier: string): string {
    return `${this.apiBaseUrl}/${companyPrefix}/issues/${identifier}`;
  }

  openAgentUrl(companyPrefix: string, agentUrlKey: string): string {
    return `${this.apiBaseUrl}/${companyPrefix}/agents/${agentUrlKey}`;
  }
}
