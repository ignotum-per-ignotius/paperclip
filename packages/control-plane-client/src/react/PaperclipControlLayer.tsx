import { useState, type FormEvent } from "react";
import {
  usePaperclipControlPlane,
  type UsePaperclipControlPlaneOptions,
} from "./usePaperclipControlPlane.js";
import type { ControlPlaneAgent, ControlPlaneIssue } from "../types.js";

export type PaperclipControlLayerProps = UsePaperclipControlPlaneOptions & {
  /** Default Paperclip URL shown in the connect form */
  defaultApiBaseUrl?: string;
  className?: string;
  title?: string;
  description?: string;
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function relativeTime(value: string | null): string {
  if (!value) return "never";
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return "unknown";
  const deltaSec = Math.round((Date.now() - ts) / 1000);
  if (deltaSec < 60) return `${deltaSec}s ago`;
  if (deltaSec < 3600) return `${Math.round(deltaSec / 60)}m ago`;
  if (deltaSec < 86400) return `${Math.round(deltaSec / 3600)}h ago`;
  return `${Math.round(deltaSec / 86400)}d ago`;
}

function statusTone(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "active" || normalized === "running" || normalized === "in_progress") return "ok";
  if (normalized === "paused" || normalized === "blocked" || normalized === "in_review") return "warn";
  if (normalized === "error" || normalized === "terminated") return "bad";
  return "neutral";
}

function AgentRow({
  agent,
  href,
}: {
  agent: ControlPlaneAgent;
  href: string | null;
}) {
  const content = (
    <>
      <div className="pcp-row-main">
        <strong>{agent.name}</strong>
        <span className={`pcp-pill pcp-pill-${statusTone(agent.status)}`}>{agent.status}</span>
      </div>
      <div className="pcp-row-meta">
        <span>{agent.title || agent.role}</span>
        <span>{agent.adapterType}</span>
        <span>
          {formatCents(agent.spentMonthlyCents)} / {formatCents(agent.budgetMonthlyCents)}
        </span>
        <span>heartbeat {relativeTime(agent.lastHeartbeatAt)}</span>
      </div>
    </>
  );
  if (!href) return <li className="pcp-row">{content}</li>;
  return (
    <li className="pcp-row">
      <a className="pcp-row-link" href={href} target="_blank" rel="noreferrer">
        {content}
      </a>
    </li>
  );
}

function IssueRow({
  issue,
  href,
  agentName,
}: {
  issue: ControlPlaneIssue;
  href: string | null;
  agentName: string | null;
}) {
  const content = (
    <>
      <div className="pcp-row-main">
        <strong>
          {issue.identifier ? `${issue.identifier} · ` : ""}
          {issue.title}
        </strong>
        <span className={`pcp-pill pcp-pill-${statusTone(issue.status)}`}>{issue.status}</span>
      </div>
      <div className="pcp-row-meta">
        <span>{agentName ?? "unassigned"}</span>
        <span>updated {relativeTime(issue.updatedAt)}</span>
      </div>
    </>
  );
  if (!href) return <li className="pcp-row">{content}</li>;
  return (
    <li className="pcp-row">
      <a className="pcp-row-link" href={href} target="_blank" rel="noreferrer">
        {content}
      </a>
    </li>
  );
}

/**
 * Embeddable Paperclip Control Layer panel for BIZEVAL (and similar products).
 *
 * Disconnected: URL + API key connect form.
 * Connected: company/division mapping, agents, active tasks, open-in-Paperclip.
 */
export function PaperclipControlLayer(props: PaperclipControlLayerProps) {
  const {
    defaultApiBaseUrl = "http://localhost:3100",
    className,
    title = "Paperclip Control Layer",
    description = "Connect your Paperclip instance to manage AI agents for this division.",
    ...hookOpts
  } = props;

  const {
    config,
    client,
    companies,
    agents,
    issues,
    actorEmail,
    version,
    activeCompany,
    panel,
    connect,
    disconnect,
    selectCompany,
    refreshWorkspace,
  } = usePaperclipControlPlane(hookOpts);

  const [apiBaseUrl, setApiBaseUrl] = useState(config?.apiBaseUrl ?? defaultApiBaseUrl);
  const [apiKey, setApiKey] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const connected = Boolean(config?.apiKey);
  const busy = panel.status === "connecting" || panel.status === "loading";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    try {
      await connect(apiBaseUrl, apiKey);
      setApiKey("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Connect failed");
    }
  }

  const agentNameById = new Map(agents.map((agent) => [agent.id, agent.name]));
  const boardUrl =
    client && activeCompany ? client.openCompanyUrl(activeCompany) : config?.apiBaseUrl ?? null;

  return (
    <section className={["pcp-root", className].filter(Boolean).join(" ")}>
      <header className="pcp-header">
        <div>
          <h2 className="pcp-title">{title}</h2>
          <p className="pcp-description">{description}</p>
        </div>
        {connected ? (
          <div className="pcp-header-actions">
            <button type="button" className="pcp-button pcp-button-secondary" onClick={() => void refreshWorkspace()} disabled={busy}>
              Refresh
            </button>
            {boardUrl ? (
              <a className="pcp-button pcp-button-secondary" href={boardUrl} target="_blank" rel="noreferrer">
                Open Paperclip
              </a>
            ) : null}
            <button type="button" className="pcp-button pcp-button-danger" onClick={disconnect}>
              Disconnect
            </button>
          </div>
        ) : null}
      </header>

      {!connected ? (
        <form className="pcp-card" onSubmit={onSubmit}>
          <h3 className="pcp-card-title">Connect Paperclip</h3>
          <p className="pcp-help">
            Paperclip is a self-hosted control plane for AI agent teams. Each BIZEVAL division maps to a
            Paperclip company. Run Paperclip locally or on Hostinger, then paste a board API key
            (`pcp_board_…`).
          </p>
          <label className="pcp-field">
            <span>Paperclip Server URL</span>
            <input
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="https://your-paperclip.hostinger.example"
              autoComplete="url"
              required
            />
            <small>The base URL of your self-hosted Paperclip instance.</small>
          </label>
          <label className="pcp-field">
            <span>API Key</span>
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your Paperclip API key"
              type="password"
              autoComplete="off"
              required
            />
          </label>
          {(formError || panel.status === "error") && (
            <p className="pcp-error" role="alert">
              {formError ?? (panel.status === "error" ? panel.message : null)}
            </p>
          )}
          <button type="submit" className="pcp-button pcp-button-primary" disabled={busy}>
            {panel.status === "connecting" ? "Connecting…" : "Connect to Paperclip"}
          </button>
        </form>
      ) : (
        <div className="pcp-connected">
          <div className="pcp-status-bar">
            <div>
              <div className="pcp-status-label">Connected</div>
              <div className="pcp-status-value">{config?.apiBaseUrl}</div>
              <div className="pcp-status-meta">
                {actorEmail ? <span>{actorEmail}</span> : null}
                {version ? <span>Paperclip {version}</span> : null}
                {hookOpts.divisionName ? <span>Division: {hookOpts.divisionName}</span> : null}
              </div>
            </div>
            <label className="pcp-field pcp-field-inline">
              <span>Paperclip company</span>
              <select
                value={config?.companyId ?? ""}
                onChange={(e) => selectCompany(e.target.value)}
                disabled={companies.length === 0}
              >
                {companies.length === 0 ? <option value="">No companies available</option> : null}
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} ({company.issuePrefix})
                  </option>
                ))}
              </select>
              <small>Maps this BIZEVAL division to a Paperclip company.</small>
            </label>
          </div>

          {panel.status === "error" ? (
            <p className="pcp-error" role="alert">
              {panel.message}
            </p>
          ) : null}

          <div className="pcp-grid">
            <section className="pcp-card">
              <div className="pcp-card-heading">
                <h3 className="pcp-card-title">Agents</h3>
                <span className="pcp-count">{agents.length}</span>
              </div>
              {agents.length === 0 ? (
                <p className="pcp-empty">No agents in this company yet. Hire one in Paperclip.</p>
              ) : (
                <ul className="pcp-list">
                  {agents.map((agent) => (
                    <AgentRow
                      key={agent.id}
                      agent={agent}
                      href={
                        client && activeCompany
                          ? client.openAgentUrl(activeCompany.issuePrefix, agent.urlKey)
                          : null
                      }
                    />
                  ))}
                </ul>
              )}
            </section>

            <section className="pcp-card">
              <div className="pcp-card-heading">
                <h3 className="pcp-card-title">Active tasks</h3>
                <span className="pcp-count">{issues.length}</span>
              </div>
              {issues.length === 0 ? (
                <p className="pcp-empty">No active tasks. Create an issue in Paperclip to assign work.</p>
              ) : (
                <ul className="pcp-list">
                  {issues.map((issue) => (
                    <IssueRow
                      key={issue.id}
                      issue={issue}
                      agentName={
                        issue.assigneeAgentId ? agentNameById.get(issue.assigneeAgentId) ?? null : null
                      }
                      href={
                        client && activeCompany && issue.identifier
                          ? client.openIssueUrl(activeCompany.issuePrefix, issue.identifier)
                          : null
                      }
                    />
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </section>
  );
}
