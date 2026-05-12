// /lib/auth.ts — signup/login for external apps.
//
// Email + 6-digit code flow. `verifyCode` sets an HttpOnly session cookie
// that authenticates subsequent /lib/api.ts calls.
//
// Context source: window.__APP__ inside the platform preview, otherwise
// Vite env vars (VITE_APP_ID, VITE_API_HOSTNAME) — see README.md.

declare global {
  interface Window {
    __APP__?: { appId: string; hostname: string };
  }
}
export interface AppUser { id: string; email: string; }
// /lib/config.ts is generated per-app with the real values baked in, so
// `npm run dev` and production builds work with zero configuration. Inside
// the platform preview, window.__APP__ takes precedence.
import { APP_ID, API_HOSTNAME } from "./config";
const ctx = (): { appId: string; hostname: string } => {
  const platform = (window as any).__APP__;
  if (platform && platform.appId && platform.hostname) return platform;
  return { appId: APP_ID, hostname: API_HOSTNAME };
};
const base = () => {
  const { hostname, appId } = ctx();
  return `${hostname}/apps/${appId}/auth`;
};

export async function sendCode(email: string): Promise<void> {
  const res = await fetch(`${base()}/send-code`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || `send-code failed: ${res.status}`);
  }
}

export async function verifyCode(email: string, code: string): Promise<AppUser> {
  const res = await fetch(`${base()}/verify-code`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || `verify-code failed: ${res.status}`);
  }
  return (await res.json()).user as AppUser;
}

export async function getUser(): Promise<AppUser | null> {
  const res = await fetch(`${base()}/me`, { credentials: "include" });
  if (!res.ok) return null;
  return ((await res.json()).user as AppUser | null) || null;
}

export async function logout(): Promise<void> {
  await fetch(`${base()}/logout`, { method: "POST", credentials: "include" });
}

export {};
