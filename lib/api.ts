// /lib/api.ts — flex-table client (external app).
//
// External apps have no platform JWT; the session lives in an HttpOnly
// cookie. We pass `credentials: "include"` so the browser sends it on each
// request. The backend resolves companyId from appId — we don't send one.
//
// Context source:
//   Inside the platform preview, the bootstrap sets window.__APP__ via
//   postMessage. Outside the platform (npm run dev / static deploy) we fall
//   back to Vite env vars (VITE_APP_ID, VITE_API_HOSTNAME) — see README.md.

declare global {
  interface Window {
    __APP__?: { appId: string; hostname: string };
  }
}
// /lib/config.ts is generated per-app with the real values baked in, so
// `npm run dev` and production builds work with zero configuration. Inside
// the platform preview, window.__APP__ takes precedence.
import { APP_ID, API_HOSTNAME } from "./config";
const ctx = (): { appId: string; hostname: string } => {
  const platform = (window as any).__APP__;
  if (platform && platform.appId && platform.hostname) return platform;
  return { appId: APP_ID, hostname: API_HOSTNAME };
};

export async function listRows<T = any>(table: string, opts?: { limit?: number }): Promise<T[]> {
  const { hostname, appId } = ctx();
  const res = await fetch(
    `${hostname}/flex/${table}/rows?appId=${appId}&limit=${opts?.limit ?? 100}`,
    { credentials: "include" },
  );
  if (res.status === 401) throw new Error("not signed in");
  if (!res.ok) throw new Error(`listRows ${table}: ${res.status}`);
  return (await res.json()).rows as T[];
}

export async function insertRow<T = any>(table: string, data: Record<string, any>): Promise<T> {
  const { hostname, appId } = ctx();
  const res = await fetch(`${hostname}/flex/${table}/rows`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appId, data }),
  });
  if (res.status === 401) throw new Error("not signed in");
  if (!res.ok) throw new Error(`insertRow ${table}: ${res.status}`);
  return await res.json();
}

export async function updateRow(table: string, rowId: string, data: Record<string, any>) {
  const { hostname, appId } = ctx();
  const res = await fetch(`${hostname}/flex/${table}/rows/${rowId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appId, data }),
  });
  if (res.status === 401) throw new Error("not signed in");
  if (!res.ok) throw new Error(`updateRow ${table}: ${res.status}`);
  return await res.json();
}

export async function deleteRow(table: string, rowId: string) {
  const { hostname, appId } = ctx();
  const res = await fetch(
    `${hostname}/flex/${table}/rows/${rowId}?appId=${appId}`,
    { method: "DELETE", credentials: "include" },
  );
  if (res.status === 401) throw new Error("not signed in");
  if (!res.ok) throw new Error(`deleteRow ${table}: ${res.status}`);
}

export {};
