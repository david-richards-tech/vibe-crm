import React from "react";
import { listOrgs, createOrg, switchOrg, type Org } from "../lib/orgs";
import { Building2, Plus, ChevronDown, Check } from "lucide-react";

interface OrgPickerProps {
  activeOrgId: string | null;
  orgs: Org[];
  onOrgChanged: (activeOrgId: string | null, orgs: Org[]) => void;
}

export default function OrgPicker({ activeOrgId, orgs, onOrgChanged }: OrgPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [newOrgName, setNewOrgName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  const activeOrg = orgs.find((o) => o.id === activeOrgId) ?? null;

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSwitch = async (orgId: string) => {
    setBusy(true);
    setErr(null);
    try {
      await switchOrg(orgId);
      const result = await listOrgs();
      if (result) onOrgChanged(result.activeOrgId, result.orgs);
      setOpen(false);
    } catch (e: any) {
      setErr(e.message || "Failed to switch org");
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async () => {
    if (!newOrgName.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await createOrg(newOrgName.trim());
      setNewOrgName("");
      setCreating(false);
      const result = await listOrgs();
      if (result) onOrgChanged(result.activeOrgId, result.orgs);
      setOpen(false);
    } catch (e: any) {
      setErr(e.message || "Failed to create org");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); setCreating(false); setErr(null); }}
        className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-indigo-200 hover:bg-white/10 hover:text-white transition-all"
      >
        <Building2 className="h-4 w-4 shrink-0" />
        <span className="truncate flex-1 text-left">
          {activeOrg ? activeOrg.name : "No organization"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
      </button>

      {open && (
        <div className="absolute left-0 bottom-full mb-2 w-64 rounded-xl border border-indigo-700/50 bg-indigo-900 shadow-2xl z-50 py-2">
          {/* Existing orgs */}
          {orgs.length > 0 && (
            <div className="px-2 pb-2 mb-2 border-b border-white/10">
              <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                Switch organization
              </p>
              {orgs.map((org) => (
                <button
                  key={org.id}
                  disabled={busy}
                  onClick={() => handleSwitch(org.id)}
                  className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-indigo-200 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                >
                  <span className="truncate flex-1 text-left">{org.name}</span>
                  {org.id === activeOrgId && (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Create new org */}
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-indigo-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <Plus className="h-4 w-4" />
              Create organization
            </button>
          ) : (
            <div className="px-3 py-2 space-y-2">
              <input
                autoFocus
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Organization name"
                className="w-full rounded-md border border-indigo-600/50 bg-indigo-950/50 px-3 py-2 text-sm text-white placeholder:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={busy || !newOrgName.trim()}
                  className="flex-1 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {busy ? "Creating…" : "Create"}
                </button>
                <button
                  onClick={() => { setCreating(false); setErr(null); }}
                  className="rounded-md px-3 py-1.5 text-sm text-indigo-300 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {err && (
            <p className="px-3 py-2 text-xs text-red-400">{err}</p>
          )}
        </div>
      )}
    </div>
  );
}
