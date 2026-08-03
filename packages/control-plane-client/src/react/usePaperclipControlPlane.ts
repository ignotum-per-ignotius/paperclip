import { useCallback, useEffect, useMemo, useState } from "react";
import { PaperclipControlPlaneClient } from "../client.js";
import { createLocalControlPlaneStorage, type ControlPlaneStorage } from "../storage.js";
import {
  PaperclipControlPlaneError,
  type ControlPlaneAgent,
  type ControlPlaneCompany,
  type ControlPlaneConnectResult,
  type ControlPlaneIssue,
  type DivisionCompanyBinding,
  type PaperclipConnectionConfig,
} from "../types.js";

export type UsePaperclipControlPlaneOptions = {
  storage?: ControlPlaneStorage;
  /** Current BIZEVAL division — used for company binding */
  divisionId?: string;
  divisionName?: string;
  /** Called after a successful connect */
  onConnected?: (result: ControlPlaneConnectResult, config: PaperclipConnectionConfig) => void;
  /** Called after disconnect */
  onDisconnected?: () => void;
};

export type ControlPlanePanelState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; message: string };

export function usePaperclipControlPlane(opts: UsePaperclipControlPlaneOptions = {}) {
  const storage = useMemo(
    () => opts.storage ?? createLocalControlPlaneStorage("bizeval."),
    [opts.storage],
  );

  const [config, setConfig] = useState<PaperclipConnectionConfig | null>(() => storage.getConnection());
  const [companies, setCompanies] = useState<ControlPlaneCompany[]>([]);
  const [actorEmail, setActorEmail] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  const [agents, setAgents] = useState<ControlPlaneAgent[]>([]);
  const [issues, setIssues] = useState<ControlPlaneIssue[]>([]);
  const [bindings, setBindings] = useState<DivisionCompanyBinding[]>(() => storage.getDivisionBindings());
  const [panel, setPanel] = useState<ControlPlanePanelState>({ status: "idle" });

  const client = useMemo(() => {
    if (!config?.apiBaseUrl || !config.apiKey) return null;
    try {
      return new PaperclipControlPlaneClient({
        apiBaseUrl: config.apiBaseUrl,
        apiKey: config.apiKey,
      });
    } catch {
      return null;
    }
  }, [config?.apiBaseUrl, config?.apiKey]);

  const activeCompany = useMemo(() => {
    if (!config?.companyId) return null;
    return companies.find((c) => c.id === config.companyId) ?? null;
  }, [companies, config?.companyId]);

  const refreshWorkspace = useCallback(async () => {
    if (!client || !config?.companyId) {
      setAgents([]);
      setIssues([]);
      return;
    }
    setPanel({ status: "loading" });
    try {
      const [nextAgents, nextIssues] = await Promise.all([
        client.listAgents(config.companyId),
        client.listIssues(config.companyId, {
          status: "todo,in_progress,in_review,blocked",
          limit: 12,
        }),
      ]);
      setAgents(nextAgents);
      setIssues(nextIssues);
      setPanel({ status: "ready" });
    } catch (err) {
      const message =
        err instanceof PaperclipControlPlaneError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load Paperclip workspace";
      setPanel({ status: "error", message });
    }
  }, [client, config?.companyId]);

  const connect = useCallback(
    async (apiBaseUrl: string, apiKey: string) => {
      setPanel({ status: "connecting" });
      try {
        const nextClient = new PaperclipControlPlaneClient({ apiBaseUrl, apiKey });
        const result = await nextClient.connect();
        const preferredCompany =
          (opts.divisionId
            ? bindings.find((b) => b.divisionId === opts.divisionId)?.companyId
            : null) ??
          result.companies[0]?.id ??
          null;
        const preferred = result.companies.find((c) => c.id === preferredCompany) ?? result.companies[0] ?? null;
        const nextConfig: PaperclipConnectionConfig = {
          apiBaseUrl: nextClient.apiBaseUrl,
          apiKey,
          companyId: preferred?.id ?? null,
          companyName: preferred?.name ?? null,
        };
        storage.setConnection(nextConfig);
        setConfig(nextConfig);
        setCompanies(result.companies);
        setActorEmail(result.actor.user?.email ?? null);
        setVersion(result.version);
        setPanel({ status: "ready" });
        opts.onConnected?.(result, nextConfig);
      } catch (err) {
        const message =
          err instanceof PaperclipControlPlaneError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not connect to Paperclip";
        setPanel({ status: "error", message });
        throw err;
      }
    },
    [bindings, opts, storage],
  );

  const disconnect = useCallback(() => {
    storage.setConnection(null);
    setConfig(null);
    setCompanies([]);
    setAgents([]);
    setIssues([]);
    setActorEmail(null);
    setVersion(null);
    setPanel({ status: "idle" });
    opts.onDisconnected?.();
  }, [opts, storage]);

  const selectCompany = useCallback(
    (companyId: string) => {
      if (!config) return;
      const company = companies.find((c) => c.id === companyId) ?? null;
      const nextConfig: PaperclipConnectionConfig = {
        ...config,
        companyId: company?.id ?? null,
        companyName: company?.name ?? null,
      };
      storage.setConnection(nextConfig);
      setConfig(nextConfig);

      if (opts.divisionId) {
        const nextBindings = [
          ...bindings.filter((b) => b.divisionId !== opts.divisionId),
          {
            divisionId: opts.divisionId,
            divisionName: opts.divisionName ?? opts.divisionId,
            companyId: company?.id ?? null,
          },
        ];
        storage.setDivisionBindings(nextBindings);
        setBindings(nextBindings);
      }
    },
    [bindings, companies, config, opts.divisionId, opts.divisionName, storage],
  );

  const apiBaseUrl = config?.apiBaseUrl ?? null;
  const apiKey = config?.apiKey ?? null;

  // Rehydrate companies/actor when an existing connection identity changes.
  useEffect(() => {
    if (!apiBaseUrl || !apiKey) return;
    let cancelled = false;
    let activeClient: PaperclipControlPlaneClient;
    try {
      activeClient = new PaperclipControlPlaneClient({ apiBaseUrl, apiKey });
    } catch {
      return;
    }
    (async () => {
      setPanel({ status: "loading" });
      try {
        const result = await activeClient.connect();
        if (cancelled) return;
        setCompanies(result.companies);
        setActorEmail(result.actor.user?.email ?? null);
        setVersion(result.version);
        const stored = storage.getConnection();
        if (!stored?.companyId && result.companies[0]) {
          const company = result.companies[0];
          const nextConfig: PaperclipConnectionConfig = {
            apiBaseUrl: activeClient.apiBaseUrl,
            apiKey: activeClient.apiKey,
            companyId: company.id,
            companyName: company.name,
          };
          storage.setConnection(nextConfig);
          setConfig(nextConfig);
        }
        setPanel({ status: "ready" });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof PaperclipControlPlaneError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Stored Paperclip connection is no longer valid";
        setPanel({ status: "error", message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, apiKey, storage]);

  useEffect(() => {
    void refreshWorkspace();
  }, [refreshWorkspace]);

  return {
    config,
    client,
    companies,
    agents,
    issues,
    actorEmail,
    version,
    activeCompany,
    panel,
    bindings,
    connect,
    disconnect,
    selectCompany,
    refreshWorkspace,
  };
}
