export type FlowCompany = {
  id: string;
  name: string;
  issuePrefix: string;
  status?: string;
};

export type FlowBoardIdentity = {
  userId: string;
  user: {
    id: string;
    email: string | null;
    name: string | null;
    image?: string | null;
  } | null;
  isInstanceAdmin: boolean;
  companyIds: string[];
  source: string;
  keyId: string | null;
};

export type FlowAgent = {
  id: string;
  companyId: string;
  name: string;
  urlKey: string;
  role: string;
  title: string | null;
  status: string;
  adapterType?: string;
  reportsTo?: string | null;
  budgetMonthlyCents?: number;
  spentMonthlyCents?: number;
  lastHeartbeatAt?: string | null;
};

export type FlowOrgNode = {
  id: string;
  name: string;
  role: string;
  status: string;
  reports: FlowOrgNode[];
};

export type FlowIssue = {
  id: string;
  identifier: string | null;
  companyId?: string;
  title: string;
  status: string;
  priority?: string | null;
  assigneeAgentId?: string | null;
  assigneeUserId?: string | null;
  projectId?: string | null;
  goalId?: string | null;
  parentId?: string | null;
  updatedAt?: string;
};

export type FlowIssueFilters = {
  status?: string;
  projectId?: string;
  parentId?: string;
  assigneeAgentId?: string;
  assigneeUserId?: string;
  q?: string;
  limit?: number;
  offset?: number;
  sortField?: "updated" | "id";
  sortDir?: "asc" | "desc";
};

export type FlowHealth = {
  status?: string;
  version?: string;
  deploymentMode?: string;
  [key: string]: unknown;
};

export type TheiaFlowBinding = {
  theiaTenantId: string;
  flowCompanyId: string;
};

export class FlowClientError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "FlowClientError";
    this.status = status;
    this.body = body;
  }
}


export type FlowCompanySkill = {
  id: string;
  key?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  status?: string;
  [key: string]: unknown;
};

export type FlowAgentSkillSnapshot = {
  adapterType: string;
  supported: boolean;
  mode?: string;
  desiredSkills?: unknown[];
  effectiveSkills?: unknown[];
  warnings?: unknown[];
  [key: string]: unknown;
};

export type FlowInstructionsBundle = {
  mode?: string;
  rootPath?: string | null;
  entryFile?: string | null;
  files?: unknown[];
  [key: string]: unknown;
};
