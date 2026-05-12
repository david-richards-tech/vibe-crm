import React from "react";
import { listRows, insertRow, updateRow, deleteRow } from "../lib/api";
import { type Page } from "../App";
import DealForm from "../components/DealForm";
import { Plus, GripVertical, Trash2, Edit3, DollarSign, ChevronRight } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface Contact { id: string; name: string; }
interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  contact_id: string;
  probability: number;
  expected_close_date: string;
  notes: string;
}

const STAGES = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

const STAGE_HEADER: Record<string, { bg: string; dot: string; text: string }> = {
  Prospecting: { bg: "bg-slate-50", dot: "bg-slate-400", text: "text-slate-700" },
  Qualification: { bg: "bg-amber-50", dot: "bg-amber-400", text: "text-amber-700" },
  Proposal: { bg: "bg-blue-50", dot: "bg-blue-400", text: "text-blue-700" },
  Negotiation: { bg: "bg-purple-50", dot: "bg-purple-400", text: "text-purple-700" },
  "Closed Won": { bg: "bg-green-50", dot: "bg-green-400", text: "text-green-700" },
  "Closed Lost": { bg: "bg-red-50", dot: "bg-red-400", text: "text-red-700" },
};

const STAGE_BORDER: Record<string, string> = {
  Prospecting: "border-l-slate-400",
  Qualification: "border-l-amber-400",
  Proposal: "border-l-blue-400",
  Negotiation: "border-l-purple-400",
  "Closed Won": "border-l-green-400",
  "Closed Lost": "border-l-red-400",
};

export default function Deals({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Deal | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [moveMenu, setMoveMenu] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [d, c] = await Promise.all([listRows<Deal>("deals"), listRows<Contact>("contacts")]);
      setDeals(d);
      setContacts(c);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const contactMap = React.useMemo(() => {
    const m: Record<string, string> = {};
    contacts.forEach((c) => { m[c.id] = c.name; });
    return m;
  }, [contacts]);

  const dealsByStage = React.useMemo(() => {
    const m: Record<string, Deal[]> = {};
    STAGES.forEach((s) => { m[s] = []; });
    deals.forEach((d) => {
      const stage = STAGES.includes(d.stage) ? d.stage : "Prospecting";
      m[stage].push(d);
    });
    return m;
  }, [deals]);

  const handleSave = async (data: Record<string, any>) => {
    if (editing) {
      await updateRow("deals", editing.id, data);
    } else {
      await insertRow("deals", data);
    }
    await load();
  };

  const handleMove = async (dealId: string, newStage: string) => {
    await updateRow("deals", dealId, { stage: newStage });
    setMoveMenu(null);
    await load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteRow("deals", deleteId);
    setDeleteId(null);
    await load();
  };

  const fmt = (v: number) => (v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v.toFixed(0)}`);

  const totalPipelineValue = deals.filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost").reduce((s, d) => s + (d.value || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-6 w-6 border-2 border-slate-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deal Pipeline</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {deals.length} deals · {fmt(totalPipelineValue)} open pipeline
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setFormOpen(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Deal
        </button>
      </div>

      {err && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm">{err}</div>}

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
        {STAGES.map((stage) => {
          const h = STAGE_HEADER[stage];
          const stageDeals = dealsByStage[stage] || [];
          const stageTotal = stageDeals.reduce((s, d) => s + (d.value || 0), 0);
          return (
            <div key={stage} className={`flex-shrink-0 w-72 ${h.bg} rounded-xl border border-slate-200`}>
              <div className="px-3 py-3 border-b border-slate-200/60">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`h-2 w-2 rounded-full ${h.dot}`} />
                  <h3 className={`text-sm font-semibold ${h.text}`}>{stage}</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{stageDeals.length} deal{stageDeals.length !== 1 ? "s" : ""}</span>
                  <span className="text-xs font-medium text-slate-600">{fmt(stageTotal)}</span>
                </div>
              </div>
              <div className="p-2 flex flex-col gap-2">
                {stageDeals.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">No deals</div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className={`bg-white rounded-lg border border-slate-200 p-3 border-l-4 ${STAGE_BORDER[deal.stage]} hover:shadow-sm transition-shadow`}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <p className="text-sm font-medium text-slate-900 leading-tight flex-1">{deal.title}</p>
                        <div className="relative">
                          <button
                            onClick={() => setMoveMenu(moveMenu === deal.id ? null : deal.id)}
                            className="p-0.5 rounded hover:bg-slate-100 text-slate-400"
                          >
                            <GripVertical className="h-3.5 w-3.5" />
                          </button>
                          {moveMenu === deal.id && (
                            <div className="absolute right-0 top-6 z-20 bg-white rounded-lg border border-slate-200 shadow-lg py-1 w-40">
                              <div className="px-3 py-1.5 text-xs font-medium text-slate-500 uppercase">Move to</div>
                              {STAGES.filter((s) => s !== deal.stage).map((s) => (
                                <button
                                  key={s}
                                  onClick={() => handleMove(deal.id, s)}
                                  className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <DollarSign className="h-3 w-3" />
                        <span>{fmt(deal.value || 0)}</span>
                        <span className="text-slate-300">·</span>
                        <span>{deal.probability || 0}%</span>
                      </div>
                      {deal.contact_id && contactMap[deal.contact_id] && (
                        <button
                          onClick={() => onNavigate({ kind: "contact-detail", contactId: deal.contact_id })}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          <ChevronRight className="h-3 w-3" />
                          {contactMap[deal.contact_id]}
                        </button>
                      )}
                      {deal.expected_close_date && (
                        <p className="text-xs text-slate-400 mt-1">Close: {deal.expected_close_date}</p>
                      )}
                      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => { setEditing(deal); setFormOpen(true); }}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setDeleteId(deal.id)}
                          className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deal form */}
      <DealForm open={formOpen} onOpenChange={setFormOpen} contacts={contacts} initialData={editing || undefined} onSubmit={handleSave} />

      {/* Delete confirmation */}
      <Dialog.Root open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-xl z-50 p-6 focus:outline-none">
            <Dialog.Title className="text-lg font-semibold text-slate-900 mb-2">Delete Deal</Dialog.Title>
            <Dialog.Description className="text-sm text-slate-600 mb-4">Are you sure? This action cannot be undone.</Dialog.Description>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
