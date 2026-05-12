import React from "react";
import { listRows, insertRow, updateRow, deleteRow } from "../lib/api";
import { type Page } from "../App";
import ContactForm from "../components/ContactForm";
import { Plus, Search, Trash2, Edit3, Users, ChevronRight } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  status: string;
  source: string;
  notes: string;
  created_at: string;
}

const STATUS_BADGE: Record<string, string> = {
  Lead: "bg-indigo-100 text-indigo-700",
  Prospect: "bg-amber-100 text-amber-700",
  Customer: "bg-emerald-100 text-emerald-700",
  Churned: "bg-red-100 text-red-700",
};

const STATUS_DOT: Record<string, string> = {
  Lead: "bg-indigo-400",
  Prospect: "bg-amber-400",
  Customer: "bg-emerald-400",
  Churned: "bg-red-400",
};

export default function Contacts({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Contact | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const rows = await listRows<Contact>("contacts");
      setContacts(rows);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Record<string, any>) => {
    if (editing) {
      await updateRow("contacts", editing.id, data);
    } else {
      await insertRow("contacts", data);
    }
    await load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteRow("contacts", deleteId);
    setDeleteId(null);
    await load();
  };

  const filtered = React.useMemo(() => {
    let list = contacts;
    if (statusFilter !== "All") {
      list = list.filter((c) => c.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [contacts, statusFilter, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-6 w-6 border-2 border-indigo-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-900">Contacts</h1>
          <p className="text-sm text-indigo-400 mt-0.5">{contacts.length} total contacts</p>
        </div>
        <button
          onClick={() => { setEditing(null); setFormOpen(true); }}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all"
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
      </div>

      {err && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 mb-4 text-sm">{err}</div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
          <input
            type="text"
            placeholder="Search contacts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-indigo-200 bg-white/60 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-indigo-300"
          />
        </div>
        <div className="flex gap-1.5">
          {["All", "Lead", "Prospect", "Customer", "Churned"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                statusFilter === s
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20"
                  : "bg-white border border-indigo-200 text-indigo-500 hover:bg-indigo-50 hover:border-indigo-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Contact list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-indigo-100 p-12 flex flex-col items-center shadow-sm">
          <Users className="h-10 w-10 text-indigo-200 mb-3" />
          <p className="text-sm font-medium text-indigo-900">No contacts found</p>
          <p className="text-xs text-indigo-400 mt-1">Add your first contact or adjust your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-indigo-100 overflow-hidden shadow-sm shadow-indigo-50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-indigo-50" style={{ background: "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)" }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-500 uppercase tracking-wider hidden md:table-cell">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-indigo-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onNavigate({ kind: "contact-detail", contactId: c.id })}
                        className="flex items-center gap-2.5 group"
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-200 to-violet-200 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0 shadow-sm">
                          {c.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-indigo-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                            {c.name}
                            <ChevronRight className="h-3 w-3 text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </p>
                          {c.title && <p className="text-xs text-indigo-400">{c.title}</p>}
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-indigo-600 hidden md:table-cell">{c.company || "—"}</td>
                    <td className="px-4 py-3 text-sm text-indigo-600 hidden sm:table-cell">{c.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[c.status] || "bg-indigo-100 text-indigo-700"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[c.status] || "bg-indigo-400"}`} />
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditing(c); setFormOpen(true); }}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-300 hover:text-indigo-600 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-indigo-300 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contact form dialog */}
      <ContactForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editing || undefined}
        onSubmit={handleSave}
      />

      {/* Delete confirmation */}
      <Dialog.Root open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 p-6 focus:outline-none">
            <Dialog.Title className="text-lg font-semibold text-indigo-900 mb-2">Delete Contact</Dialog.Title>
            <Dialog.Description className="text-sm text-indigo-500 mb-4">
              Are you sure? This will permanently remove this contact and cannot be undone.
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-medium text-indigo-500 hover:text-indigo-700 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/25">Delete</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
