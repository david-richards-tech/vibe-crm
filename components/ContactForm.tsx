import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

const STATUSES = ["Lead", "Prospect", "Customer", "Churned"];
const SOURCES = ["Website", "Referral", "Cold Call", "LinkedIn", "Event", "Other"];

export default function ContactForm({ open, onOpenChange, initialData, onSubmit }: ContactFormProps) {
  const [name, setName] = React.useState(initialData?.name ?? "");
  const [email, setEmail] = React.useState(initialData?.email ?? "");
  const [phone, setPhone] = React.useState(initialData?.phone ?? "");
  const [company, setCompany] = React.useState(initialData?.company ?? "");
  const [title, setTitle] = React.useState(initialData?.title ?? "");
  const [status, setStatus] = React.useState(initialData?.status ?? "Lead");
  const [source, setSource] = React.useState(initialData?.source ?? "Website");
  const [notes, setNotes] = React.useState(initialData?.notes ?? "");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setEmail(initialData?.email ?? "");
      setPhone(initialData?.phone ?? "");
      setCompany(initialData?.company ?? "");
      setTitle(initialData?.title ?? "");
      setStatus(initialData?.status ?? "Lead");
      setSource(initialData?.source ?? "Website");
      setNotes(initialData?.notes ?? "");
      setErr(null);
    }
  }, [open, initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErr("Name is required");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim(), company: company.trim(), title: title.trim(), status, source, notes: notes.trim() });
      onOpenChange(false);
    } catch (e: any) {
      setErr(e.message || "Failed to save contact");
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
              {initialData ? "Edit Contact" : "Add Contact"}
            </Dialog.Title>
            <Dialog.Close className="p-1 rounded-md hover:bg-indigo-100">
              <X className="h-4 w-4 text-indigo-400" />
            </Dialog.Close>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-indigo-800 mb-1">Full Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-indigo-300" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-indigo-300" placeholder="john@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800 mb-1">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-indigo-300" placeholder="+1 555-0123" />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800 mb-1">Company</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-indigo-300" placeholder="Acme Corp" />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800 mb-1">Job Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-indigo-300" placeholder="CEO" />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800 mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800 mb-1">Source</label>
                <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
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
                {busy ? "Saving…" : initialData ? "Save Changes" : "Add Contact"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
