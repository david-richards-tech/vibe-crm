import React from "react";
import { listRows, insertRow, deleteRow } from "../lib/api";
import { type Page } from "../App";
import ActivityForm from "../components/ActivityForm";
import { Plus, Phone, Mail, Calendar, FileText, Trash2, Filter } from "lucide-react";
import dayjs from "dayjs";

interface Contact { id: string; name: string; }
interface Deal { id: string; title: string; }
interface Activity {
  id: string;
  type: string;
  description: string;
  contact_id: string;
  deal_id: string;
  date: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  Call: { icon: <Phone className="h-4 w-4" />, color: "text-blue-600", bg: "bg-blue-50" },
  Email: { icon: <Mail className="h-4 w-4" />, color: "text-emerald-600", bg: "bg-emerald-50" },
  Meeting: { icon: <Calendar className="h-4 w-4" />, color: "text-violet-600", bg: "bg-violet-50" },
  Note: { icon: <FileText className="h-4 w-4" />, color: "text-amber-600", bg: "bg-amber-50" },
};

const TYPES = ["All", "Call", "Email", "Meeting", "Note"];

export default function Activities({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [typeFilter, setTypeFilter] = React.useState("All");
  const [search, setSearch] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [a, c, d] = await Promise.all([
        listRows<Activity>("activities"),
        listRows<Contact>("contacts"),
        listRows<Deal>("deals"),
      ]);
      setActivities(a.sort((x, y) => (y.date || "").localeCompare(x.date || "")));
      setContacts(c);
      setDeals(d);
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

  const dealMap = React.useMemo(() => {
    const m: Record<string, string> = {};
    deals.forEach((d) => { m[d.id] = d.title; });
    return m;
  }, [deals]);

  const filtered = React.useMemo(() => {
    let list = activities;
    if (typeFilter !== "All") {
      list = list.filter((a) => a.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.description?.toLowerCase().includes(q) ||
          (contactMap[a.contact_id] || "").toLowerCase().includes(q) ||
          (dealMap[a.deal_id] || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [activities, typeFilter, search, contactMap, dealMap]);

  const handleSave = async (data: Record<string, any>) => {
    await insertRow("activities", data);
    await load();
  };

  const handleDelete = async (id: string) => {
    await deleteRow("activities", id);
    await load();
  };

  // Group by date
  const grouped = React.useMemo(() => {
    const groups: Record<string, Activity[]> = {};
    filtered.forEach((a) => {
      const key = a.date ? dayjs(a.date).format("YYYY-MM-DD") : "No Date";
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-6 w-6 border-2 border-indigo-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-900">Activities</h1>
          <p className="text-sm text-indigo-400 mt-0.5">{activities.length} total activities logged</p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all"
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
        >
          <Plus className="h-4 w-4" />
          Log Activity
        </button>
      </div>

      {err && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 mb-4 text-sm">{err}</div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
          <input
            type="text"
            placeholder="Search activities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-indigo-200 bg-white/60 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-indigo-300"
          />
        </div>
        <div className="flex gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                typeFilter === t
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20"
                  : "bg-white border border-indigo-200 text-indigo-500 hover:bg-indigo-50 hover:border-indigo-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Activity timeline */}
      {grouped.length === 0 ? (
        <div className="bg-white rounded-xl border border-indigo-100 p-12 flex flex-col items-center shadow-sm">
          <Calendar className="h-10 w-10 text-indigo-200 mb-3" />
          <p className="text-sm font-medium text-indigo-900">No activities found</p>
          <p className="text-xs text-indigo-400 mt-1">Log your first activity to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(([dateKey, items]) => (
            <div key={dateKey}>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
                  {dateKey === "No Date" ? "No Date" : dayjs(dateKey).format("MMMM D, YYYY")}
                </p>
                <div className="flex-1 h-px bg-indigo-100" />
                <span className="text-xs text-indigo-400">{items.length}</span>
              </div>
              <div className="flex flex-col gap-2 ml-4 border-l-2 border-indigo-200 pl-4">
                {items.map((a) => {
                  const config = TYPE_CONFIG[a.type] || TYPE_CONFIG.Note;
                  return (
                    <div
                      key={a.id}
                      className="bg-white rounded-lg border border-indigo-100 p-4 hover:shadow-md hover:shadow-indigo-100/50 transition-all relative"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-9 w-9 rounded-lg ${config.bg} ${config.color} flex items-center justify-center shrink-0 -ml-8 shadow-sm`}>
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${config.color} ${config.bg} px-2 py-0.5 rounded-md`}>{a.type}</span>
                            <span className="text-xs text-indigo-400">
                              {a.date ? dayjs(a.date).format("h:mm A") : ""}
                            </span>
                          </div>
                          <p className="text-sm text-indigo-900">{a.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            {a.contact_id && contactMap[a.contact_id] && (
                              <button
                                onClick={() => onNavigate({ kind: "contact-detail", contactId: a.contact_id })}
                                className="text-xs text-indigo-400 hover:text-indigo-700 hover:underline transition-colors"
                              >
                                📇 {contactMap[a.contact_id]}
                              </button>
                            )}
                            {a.deal_id && dealMap[a.deal_id] && (
                              <span className="text-xs text-indigo-400">
                                🤝 {dealMap[a.deal_id]}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-1 rounded-md hover:bg-red-50 text-indigo-300 hover:text-red-500 transition-colors shrink-0"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity form */}
      <ActivityForm open={formOpen} onOpenChange={setFormOpen} contacts={contacts} deals={deals} onSubmit={handleSave} />
    </div>
  );
}
