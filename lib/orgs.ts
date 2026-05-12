// /lib/orgs.ts — organizations for external apps.
//
// Orgs let end-users group themselves so 'org'-scoped flex tables share
// data only among teammates. A user can belong to many orgs in the same
// app; one is 'active' at a time and that's what scopes data reads/writes.
//
// All calls are cookie-authenticated — sign in first via /lib/auth.ts.

declare global {
  interface Window {
    __APP__?: { appId: string; hostname: string };
  }
}
import { APP_ID, API_HOSTNAME } from "./config";
const ctx = (): { appId: string; hostname: string } => {
  const platform = (window as any).__APP__;
  if (platform && platform.appId && platform.hostname) return platform;
  return { appId: APP_ID, hostname: API_HOSTNAME };
};
const base = () => {
  const { hostname, appId } = ctx();
  return `${hostname}/apps/${appId}/orgs`;
};

export interface Org {
  id: string;
  appId: string;
  name: string;
  createdByUserId: string | null;
  // The caller's role in this org: 'owner' | 'admin' | 'member'.
  role: string | null;
}

export interface OrgMember {
  userId: string;
  email: string;
  role: string;
}

async function jsonOrThrow(res: Response, op: string) {
  if (res.status === 401) throw new Error("not signed in");
  if (res.status === 403) throw new Error("forbidden");
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || `${op} failed: ${res.status}`);
  }
  return await res.json();
}

// List orgs the signed-in user belongs to, plus the currently active org id
// (or null if none is selected). Returns null when not signed in.
export async function listOrgs(): Promise<{ orgs: Org[]; activeOrgId: string | null } | null> {
  const res = await fetch(`${base()}`, { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`listOrgs failed: ${res.status}`);
  return await res.json();
}

// Create a new org. The creator becomes its owner and the new org is set
// as the caller's active org automatically.
export async function createOrg(name: string): Promise<Org> {
  const res = await fetch(`${base()}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const j = await jsonOrThrow(res, "createOrg");
  return j.org as Org;
}

export async function renameOrg(orgId: string, name: string): Promise<Org> {
  const res = await fetch(`${base()}/${orgId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const j = await jsonOrThrow(res, "renameOrg");
  return j.org as Org;
}

// Set the active org. Subsequent flex-table reads/writes against 'org'-scoped
// tables will use this org. Throws if the caller isn't a member.
export async function switchOrg(orgId: string): Promise<void> {
  const res = await fetch(`${base()}/${orgId}/switch`, {
    method: "POST",
    credentials: "include",
  });
  await jsonOrThrow(res, "switchOrg");
}

// Clear the active org — 'org'-scoped reads/writes will then return empty
// until the user switches back into an org.
export async function clearActiveOrg(): Promise<void> {
  const res = await fetch(`${base()}/switch`, {
    method: "DELETE",
    credentials: "include",
  });
  await jsonOrThrow(res, "clearActiveOrg");
}

export async function listMembers(orgId: string): Promise<OrgMember[]> {
  const res = await fetch(`${base()}/${orgId}/members`, { credentials: "include" });
  const j = await jsonOrThrow(res, "listMembers");
  return j.members as OrgMember[];
}

export async function removeMember(orgId: string, userId: string): Promise<void> {
  const res = await fetch(`${base()}/${orgId}/members/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });
  await jsonOrThrow(res, "removeMember");
}

export async function setMemberRole(
  orgId: string,
  userId: string,
  role: "owner" | "admin" | "member",
): Promise<void> {
  const res = await fetch(`${base()}/${orgId}/members/${userId}/role`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  await jsonOrThrow(res, "setMemberRole");
}

// Invite an email to an org. The recipient gets a 6-digit code — they sign
// in to the app with the same email and call `acceptInvite(code)`.
export async function inviteUser(
  orgId: string,
  email: string,
  role: "owner" | "admin" | "member" = "member",
): Promise<{ id: string; email: string; role: string; expires_at: string }> {
  const res = await fetch(`${base()}/${orgId}/invites`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, role }),
  });
  return await jsonOrThrow(res, "inviteUser");
}

// Redeem an invite code. The caller must already be signed in with the
// invited email address. On success the joined org becomes the active org.
export async function acceptInvite(code: string): Promise<{ organizationId: string; role: string }> {
  const res = await fetch(`${base()}/accept-invite`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  return await jsonOrThrow(res, "acceptInvite");
}

export {};
