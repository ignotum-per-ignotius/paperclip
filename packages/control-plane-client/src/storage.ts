import type { DivisionCompanyBinding, PaperclipConnectionConfig } from "./types.js";

export type ControlPlaneStorage = {
  getConnection(): PaperclipConnectionConfig | null;
  setConnection(config: PaperclipConnectionConfig | null): void;
  getDivisionBindings(): DivisionCompanyBinding[];
  setDivisionBindings(bindings: DivisionCompanyBinding[]): void;
};

const CONNECTION_KEY = "paperclip.controlPlane.connection.v1";
const BINDINGS_KEY = "paperclip.controlPlane.divisionBindings.v1";

function canUseLocalStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function createLocalControlPlaneStorage(prefix = ""): ControlPlaneStorage {
  const connectionKey = `${prefix}${CONNECTION_KEY}`;
  const bindingsKey = `${prefix}${BINDINGS_KEY}`;

  return {
    getConnection() {
      if (!canUseLocalStorage()) return null;
      const raw = localStorage.getItem(connectionKey);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as PaperclipConnectionConfig;
      } catch {
        return null;
      }
    },
    setConnection(config) {
      if (!canUseLocalStorage()) return;
      if (!config) {
        localStorage.removeItem(connectionKey);
        return;
      }
      localStorage.setItem(connectionKey, JSON.stringify(config));
    },
    getDivisionBindings() {
      if (!canUseLocalStorage()) return [];
      const raw = localStorage.getItem(bindingsKey);
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as DivisionCompanyBinding[]) : [];
      } catch {
        return [];
      }
    },
    setDivisionBindings(bindings) {
      if (!canUseLocalStorage()) return;
      localStorage.setItem(bindingsKey, JSON.stringify(bindings));
    },
  };
}
