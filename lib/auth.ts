// /lib/auth.ts — signup/login for external apps.
//
// Email + 6-digit code flow. `verifyCode` sets an HttpOnly session cookie
// that authenticates subsequent /lib/api.ts calls.

declare global {
  interface Window {
    __APP__: { appId: string; hostname: string };
  }
}
export interface AppUser { id: string; email: string; }
const ctx = () => (window as any).__APP__;
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
