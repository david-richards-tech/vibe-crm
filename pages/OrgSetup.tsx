import React from "react";
import { listOrgs, createOrg, switchOrg, type Org } from "../lib/orgs";
import { Building2, Plus, Users, ArrowRight } from "lucide-react";

interface OrgSetupProps {
  onReady: (activeOrgId: string, orgs: Org[]) => void;
}

export default function OrgSetup({ onReady }: OrgSetupProps) {
  const [orgs, setOrgs] = React.useState<Org[]>([]);
  const [activeOrgId, setActiveOrgId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  // Creating
  const [creating, setCreating] = React.useState(false);
  const [newOrgName, setNewOrgName] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const refresh = React.useCallback(async () => {
    try {
      const result = await listOrgs();
      if (!result) {
        setErr("Could not load organizations. Please sign in again.");
        setLoading(false);
        return;
      }
      setOrgs(result.orgs);
      setActiveOrgId(result.activeOrgId);
      if (result.activeOrgId) {
        onReady(result.activeOrgId, result.orgs);
      }
      setLoading(false);
    } catch (e: any) {
      setErr(e.message || "Failed to load organizations");
      setLoading(false);
    }
  }, [onReady]);

  React.useEffect(() => { refresh(); }, [refresh]);

  const handleCreate = async () => {
    if (!newOrgName.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await createOrg(newOrgName.trim());
      setNewOrgName("");
      setCreating(false);
      await refresh();
    } catch (e: any) {
      setErr(e.message || "Failed to create organization");
    } finally {
      setBusy(false);
    }
  };

  const handleSwitch = async (orgId: string) => {
    setBusy(true);
    setErr(null);
    try {
      await switchOrg(orgId);
      await refresh();
    } catch (e: any) {
      setErr(e.message || "Failed to switch organization");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-6 w-6 border-2 border-indigo-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-indigo-900">Choose an organization</h1>
          <p className="text-sm text-indigo-500 mt-2">
            Your data is organized by team. Join or create an organization to get started.
          </p>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-white shadow-sm overflow-hidden">
          {/* Existing orgs */}
          {orgs.length > 0 && (
            <div className="p-4 border-b border-indigo-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-3">
                Your organizations
              </p>
              <div className="space-y-2">
                {orgs.map((org) => (
                  <button
                    key={org.id}
                    disabled={busy}
                    onClick={() => handleSwitch(org.id)}
                    className="flex items-center gap-3 w-full rounded-lg border border-indigo-100 px-4 py-3 text-left hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group disabled:opacity-50"
                  >
                    <div className="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-indigo-900 truncate">{org.name}</p>
                      <p className="text-xs text-indigo-400 capitalize">{org.role || "member"}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-indigo-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Create new org */}
          <div className="p-4">
            {!creating ? (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-3 w-full rounded-lg border-2 border-dashed border-indigo-200 px-4 py-3 text-left hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
              >
                <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <Plus className="h-4 w-4 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-700">Create new organization</p>
                  <p className="text-xs text-indigo-400">Start a new team workspace</p>
                </div>
              </button>
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  New organization
                </label>
                <input
                  autoFocus
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm text-indigo-900 placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    disabled={busy || !newOrgName.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    {busy ? (
                      <><div className="animate-spin h-4 w-4 border-2 border-white/40 border-t-transparent rounded-full" /> Creating…</>
                    ) : (
                      <><Plus className="h-4 w-4" /> Create</>
                    )}
                  </button>
                  <button
                    onClick={() => { setCreating(false); setErr(null); }}
                    className="rounded-lg border border-indigo-200 px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {err && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}
      </div>
    </div>
  );
}
