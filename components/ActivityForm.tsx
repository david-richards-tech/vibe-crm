import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: { id: string; name: string }[];
  deals: { id: string; title: string }[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

const TYPES = ["Call", "Email", "Meeting", "Note"];

export default function ActivityForm({ open, onOpenChange, contacts, deals, initialData, onSubmit }: ActivityFormProps) {
  const [type, setType] = React.useState(initialData?.type ?? "Note");
  const [description, setDescription] = React.useState(initialData?.description ?? "");
  const [contactId, setContactId] = React.useState(initialData?.contact_id ?? "");
  const [dealId, setDealId] = React.useState(initialData?.deal_id ?? "");
  const [date, setDate] = React.useState(initialData?.date ?? new Date().toISOString().slice(0, 16));
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setType(initialData?.type ?? "Note");
      setDescription(initialData?.description ?? "");
      setContactId(initialData?.contact_id ?? "");
      setDealId(initialData?.deal_id ?? "");
      setDate(initialData?.date ?? new Date().toISOString().slice(0, 16));
      setErr(null);
    }
  }, [open, initialData]);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setErr("Description is required");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await onSubmit({
        type,
        description: description.trim(),
        contact_id: contactId,
        deal_id: dealId,
        date,
      });
      onOpenChange(false);
    } catch (e: any) {
      setErr(e.message || "Failed to save activity");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 focus:outline-none max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100" style={{ background: "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)" }}>
            <Dialog.Title className="text-lg font-semibold text-indigo-900">
              {initialData ? "Edit Activity" : "Log Activity"}
            </Dialog.Title>
            <Dialog.Close className="p-1 rounded-md hover:bg-indigo-100">
              <X className="h-4 w-4 text-indigo-400" />
            </Dialog.Close>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-indigo-800 mb-1">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800 mb-1">Date & Time</label>
                <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800 mb-1">Contact</label>
                <select value={contactId} onChange={(e) => setContactId(e.target.value)} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">— None —</option>
                  {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800 mb-1">Deal</label>
                <select value={dealId} onChange={(e) => setDealId(e.target.value)} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">— None —</option>
                  {deals.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-800 mb-1">Description *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none placeholder:text-indigo-300" placeholder="Describe the activity…" />
            </div>
            {err && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm">{err}</div>}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm font-medium text-indigo-500 hover:text-indigo-700 transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={busy} className="px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}>
                {busy ? "Saving…" : initialData ? "Save Changes" : "Log Activity"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
