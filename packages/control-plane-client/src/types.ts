export type ControlPlaneCompany = {
  id: string;
  name: string;
  issuePrefix: string;
};

export type ControlPlaneActor = {
  userId: string;
  user: { id: string; name: string | null; email: string | null } | null;
  isInstanceAdmin: boolean;
  source: string;
  keyId: string | null;
};

export type ControlPlaneConnectResult = {
  ok: true;
  controlPlane: "paperclip";
  version: string;
  actor: ControlPlaneActor;
  companies: ControlPlaneCompany[];
};

export type ControlPlaneAgent = {
  id: string;
  companyId: string;
  name: string;
  urlKey: string;
  role: string;
  title: string | null;
  status: string;
  adapterType: string;
  budgetMonthlyCents: number;
  spentMonthlyCents: number;
  lastHeartbeatAt: string | null;
  pauseReason: string | null;
};

export type ControlPlaneIssue = {
  id: string;
  identifier: string | null;
  title: string;
  status: string;
  priority: string | null;
  assigneeAgentId: string | null;
  updatedAt: string;
};

export type ControlPlaneHealth = {
  status?: string;
  version?: string;
  [key: string]: unknown;
};

export type PaperclipConnectionConfig = {
  /** Base URL of the Paperclip instance, e.g. https://paperclip.example.com */
  apiBaseUrl: string;
  /** Board API key (`pcp_board_…`) */
  apiKey: string;
  /** Selected company for division mapping */
  companyId: string | null;
  companyName: string | null;
};

export type DivisionCompanyBinding = {
  divisionId: string;
  divisionName: string;
  companyId: string | null;
};

export class PaperclipControlPlaneError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "PaperclipControlPlaneError";
    this.status = status;
    this.body = body;
  }
}
