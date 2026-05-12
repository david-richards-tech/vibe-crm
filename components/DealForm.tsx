import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface DealFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: { id: string; name: string }[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

const STAGES = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

export default function DealForm({ open, onOpenChange, contacts, initialData, onSubmit }: DealFormProps) {
  const [title, setTitle] = React.useState(initialData?.title ?? "");
  const [value, setValue] = React.useState(initialData?.value?.toString() ?? "");
  const [stage, setStage] = React.useState(initialData?.stage ?? "Prospecting");
  const [contactId, setContactId] = React.useState(initialData?.contact_id ?? "");
  const [probability, setProbability] = React.useState(initialData?.probability?.toString() ?? "20");
  const [expectedCloseDate, setExpectedCloseDate] = React.useState(initialData?.expected_close_date ?? "");
  const [notes, setNotes] = React.useState(initialData?.notes ?? "");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? "");
      setValue(initialData?.value?.toString() ?? "");
      setStage(initialData?.stage ?? "Prospecting");
      setContactId(initialData?.contact_id ?? "");
      setProbability(initialData?.probability?.toString() ?? "20");
      setExpectedCloseDate(initialData?.expected_close_date ?? "");
      setNotes(initialData?.notes ?? "");
      setErr(null);
    }
  }, [open, initialData]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErr("Deal title is required");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await onSubmit({
        title: title.trim(),
        value: parseFloat(value) || 0,
        stage,
        contact_id: contactId,
        probability: parseInt(probability) || 0,
        expected_close_date: expectedCloseDate,
        notes: notes.trim(),
      });
      onOpenChange(false);
    } catch (e: any) {
      setErr(e.message || "Failed to save deal");
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
              {initialData ? "Edit Deal" : "Add Deal"}
            </Dialog.Title>
            <Dialog.Close className="p-1 rounded-md hover:bg-indigo-100">
              <X className="h-4 w-4 text-indigo-400" />
            </Dialog.Close>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-indigo-800 mb-1">Deal Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-indigo-300" placeholder="Enter deal title…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-indigo-800 mb-1">Value ($)</label>
                <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800 mb-1">Stage</label>
                <select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800 mb-1">Contact</label>
                <select value={contactId} onChange={(e) => setContactId(e.target.value)} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">— None —</option>
                  {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800 mb-1">Probability (%)</label>
                <input type="number" min={0} max={100} value={probability} onChange={(e) => setProbability(e.target.value)} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-indigo-800 mb-1">Expected Close Date</label>
                <input type="date" value={expectedCloseDate} onChange={(e) => setExpectedCloseDate(e.target.value)} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-800 mb-1">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none placeholder:text-indigo-300" placeholder="Additional notes…" />
            </div>
            {err && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm">{err}</div>}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm font-medium text-indigo-500 hover:text-indigo-700 transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={busy} className="px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}>
                {busy ? "Saving…" : initialData ? "Save Changes" : "Add Deal"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
