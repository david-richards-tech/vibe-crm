import React from "react";
import { listRows, updateRow, insertRow, deleteRow } from "../lib/api";
import { type Page } from "../App";
import ContactForm from "../components/ContactForm";
import DealForm from "../components/DealForm";
import ActivityForm from "../components/ActivityForm";
import { ArrowLeft, Mail, Phone, Building2, Edit3, Plus, DollarSign, Handshake, Activity as ActivityIcon, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import * as Dialog from "@radix-ui/react-dialog";

interface Contact { id: string; name: string; email: string; phone: string; company: string; title: string; status: string; source: string; notes: string; }
interface Deal { id: string; title: string; value: number; stage: string; contact_id: string; probability: number; expected_close_date: string; notes: string; }
interface Activity { id: string; type: string; description: string; contact_id: string; deal_id: string; date: string; }

const STATUS_BADGE: Record<string, string> = {
  Lead: "bg-slate-100 text-slate-700",
  Prospect: "bg-amber-100 text-amber-700",
  Customer: "bg-green-100 text-green-700",
  Churned: "bg-red-100 text-red-700",
};

const STAGE_COLORS: Record<string, string> = {
  Prospecting: "bg-slate-100 text-slate-700",
  Qualification: "bg-amber-100 text-amber-700",
  Proposal: "bg-blue-100 text-blue-700",
  Negotiation: "bg-purple-100 text-purple-700",
  "Closed Won": "bg-green-100 text-green-700",
  "Closed Lost": "bg-red-100 text-red-700",
};

const ACTIVITY_ICONS: Record<string, string> = {
  Call: "📞",
  Email: "✉️",
  Meeting: "📅",
  Note: "📝",
};

export default function ContactDetail({ contactId, onNavigate }: { contactId: string; onNavigate: (p: Page) => void }) {
  const [contact, setContact] = React.useState<Contact | null>(null);
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [allDeals, setAllDeals] = React.useState<Deal[]>([]);
  const [allContacts, setAllContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [dealFormOpen, setDealFormOpen] = React.useState(false);
  const [activityFormOpen, setActivityFormOpen] = React.useState(false);
  const [deleteDealId, setDeleteDealId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [c, d, a, allD, allC] = await Promise.all([
        listRows<Contact>("contacts"),
        listRows<Deal>("deals"),
        listRows<Activity>("activities"),
        listRows<Deal>("deals"),
        listRows<Contact>("contacts"),
      ]);
      const found = c.find((x) => x.id === contactId);
      if (!found) throw new Error("Contact not found");
      setContact(found);
      setDeals(d.filter((x) => x.contact_id === contactId));
      setActivities(a.filter((x) => x.contact_id === contactId).sort((a, b) => (b.date || "").localeCompare(a.date || "")));
      setAllDeals(allD);
      setAllContacts(allC);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  React.useEffect(() => { load(); }, [load]);

  const handleSaveContact = async (data: Record<string, any>) => {
    if (contact) {
      await updateRow("contacts", contact.id, data);
      await load();
    }
  };

  const handleSaveDeal = async (data: Record<string, any>) => {
    await insertRow("deals", { ...data, contact_id: contactId });
    await load();
  };

  const handleSaveActivity = async (data: Record<string, any>) => {
    await insertRow("activities", { ...data, contact_id: contactId });
    await load();
  };

  const handleDeleteDeal = async () => {
    if (!deleteDealId) return;
    await deleteRow("deals", deleteDealId);
    setDeleteDealId(null);
    await load();
  };

  const fmt = (v: number) => `$${v.toLocaleString()}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-6 w-6 border-2 border-slate-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (err || !contact) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4">{err || "Contact not found"}</div>
        <button onClick={() => onNavigate({ kind: "contacts" })} className="mt-4 text-sm text-slate-600 hover:text-slate-900 underline">← Back to Contacts</button>
      </div>
    );
  }

  const totalDealValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const openDeals = deals.filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <button
        onClick={() => onNavigate({ kind: "contacts" })}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Contacts
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-600 shrink-0">
              {contact.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-slate-900">{contact.name}</h1>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[contact.status] || "bg-slate-100 text-slate-700"}`}>
                  {contact.status}
                </span>
              </div>
              {contact.title && <p className="text-sm text-slate-500">{contact.title}</p>}
            </div>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100">
          {contact.email && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" />
              <a href={`mailto:${contact.email}`} className="hover:text-slate-900 hover:underline">{contact.email}</a>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4 text-slate-400" />
              {contact.phone}
            </div>
          )}
          {contact.company && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="h-4 w-4 text-slate-400" />
              {contact.company}
            </div>
          )}
        </div>
        {contact.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-1">Notes</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{contact.notes}</p>
          </div>
        )}
        {contact.source && (
          <div className="mt-3">
            <span className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded-md">Source: {contact.source}</span>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Handshake className="h-4 w-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{openDeals.length}</p>
            <p className="text-xs text-slate-500">Open Deals</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{fmt(totalDealValue)}</p>
            <p className="text-xs text-slate-500">Total Deal Value</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ActivityIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{activities.length}</p>
            <p className="text-xs text-slate-500">Activities</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deals */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Deals</h2>
            <button
              onClick={() => setDealFormOpen(true)}
              className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
          {deals.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No deals yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {deals.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{d.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${STAGE_COLORS[d.stage] || ""}`}>{d.stage}</span>
                      <span className="text-xs text-slate-500">{fmt(d.value || 0)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteDealId(d.id)}
                    className="p-1 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activities */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Activity Timeline</h2>
            <button
              onClick={() => setActivityFormOpen(true)}
              className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Log
            </button>
          </div>
          {activities.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No activities yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {activities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100">
                  <span className="text-lg mt-0.5 shrink-0">{ACTIVITY_ICONS[a.type] || "📝"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900">{a.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {a.type} · {a.date ? dayjs(a.date).format("MMM D, h:mm A") : "No date"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ContactForm open={editOpen} onOpenChange={setEditOpen} initialData={contact || undefined} onSubmit={handleSaveContact} />
      <DealForm open={dealFormOpen} onOpenChange={setDealFormOpen} contacts={allContacts} onSubmit={handleSaveDeal} />
      <ActivityForm open={activityFormOpen} onOpenChange={setActivityFormOpen} contacts={allContacts} deals={allDeals} onSubmit={handleSaveActivity} />

      {/* Delete deal confirmation */}
      <Dialog.Root open={!!deleteDealId} onOpenChange={(o) => !o && setDeleteDealId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-xl z-50 p-6 focus:outline-none">
            <Dialog.Title className="text-lg font-semibold text-slate-900 mb-2">Delete Deal</Dialog.Title>
            <Dialog.Description className="text-sm text-slate-600 mb-4">Are you sure? This action cannot be undone.</Dialog.Description>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteDealId(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Cancel</button>
              <button onClick={handleDeleteDeal} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
