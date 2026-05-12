import React from "react";
import { listRows } from "../lib/api";
import { type Page } from "../App";
import StatCard from "../components/StatCard";
import { Users, Handshake, DollarSign, TrendingUp, Phone, Mail, Calendar, Sparkles } from "lucide-react";
import dayjs from "dayjs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Contact { id: string; name: string; email: string; phone: string; company: string; status: string; source: string; }
interface Deal { id: string; title: string; value: number; stage: string; contact_id: string; probability: number; expected_close_date: string; }
interface Activity { id: string; type: string; description: string; contact_id: string; deal_id: string; date: string; }

const STAGE_COLORS: Record<string, string> = {
  Prospecting: "#818cf8",
  Qualification: "#f59e0b",
  Proposal: "#6366f1",
  Negotiation: "#8b5cf6",
  "Closed Won": "#10b981",
  "Closed Lost": "#ef4444",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Call: <Phone className="h-3.5 w-3.5" />,
  Email: <Mail className="h-3.5 w-3.5" />,
  Meeting: <Calendar className="h-3.5 w-3.5" />,
  Note: <TrendingUp className="h-3.5 w-3.5" />,
};

const TYPE_COLORS: Record<string, string> = {
  Call: "bg-blue-50 text-blue-600",
  Email: "bg-emerald-50 text-emerald-600",
  Meeting: "bg-violet-50 text-violet-600",
  Note: "bg-amber-50 text-amber-600",
};

export default function Dashboard({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [c, d, a] = await Promise.all([listRows<Contact>("contacts"), listRows<Deal>("deals"), listRows<Activity>("activities")]);
      setContacts(c);
      setDeals(d);
      setActivities(a);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-6 w-6 border-2 border-indigo-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4">{err}</div>
      </div>
    );
  }

  const totalContacts = contacts.length;
  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const wonDeals = deals.filter((d) => d.stage === "Closed Won");
  const wonValue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const weightedPipeline = deals.filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost").reduce((sum, d) => sum + (d.value || 0) * (d.probability || 0) / 100, 0);

  // Pipeline by stage
  const stages = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
  const pipelineData = stages.map((stage) => ({
    stage,
    value: deals.filter((d) => d.stage === stage).reduce((sum, d) => sum + (d.value || 0), 0),
    count: deals.filter((d) => d.stage === stage).length,
  }));

  // Contacts by status
  const statuses = ["Lead", "Prospect", "Customer", "Churned"];
  const statusColors = ["#818cf8", "#f59e0b", "#10b981", "#ef4444"];
  const statusData = statuses.map((status, i) => ({
    name: status,
    value: contacts.filter((c) => c.status === status).length,
    color: statusColors[i],
  })).filter((d) => d.value > 0);

  // Recent activities
  const recentActivities = [...activities]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 5);

  const fmt = (v: number) => (v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v.toFixed(0)}`);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-900">Dashboard</h1>
          <p className="text-sm text-indigo-400 mt-0.5">Overview of your CRM pipeline</p>
        </div>
        <button
          onClick={loadData}
          className="text-sm text-indigo-500 hover:text-indigo-700 underline underline-offset-2 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Contacts"
          value={totalContacts}
          icon={<Users className="h-5 w-5" />}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Open Deals"
          value={deals.filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost").length}
          icon={<Handshake className="h-5 w-5" />}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Pipeline Value"
          value={fmt(totalValue)}
          icon={<DollarSign className="h-5 w-5" />}
          gradient="linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
        />
        <StatCard
          label="Weighted Pipeline"
          value={fmt(weightedPipeline)}
          icon={<TrendingUp className="h-5 w-5" />}
          change={`${wonDeals.length} won`}
          changeType="positive"
          gradient="linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-indigo-100 p-5 shadow-sm shadow-indigo-50">
          <h2 className="text-sm font-semibold text-indigo-900 mb-4">Pipeline by Stage</h2>
          {pipelineData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pipelineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#6366f1" }} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: "#818cf8" }} tickFormatter={(v: number) => fmt(v)} width={60} />
                <Tooltip formatter={(v: number) => fmt(v)} labelStyle={{ fontWeight: 600, color: "#312e81" }} contentStyle={{ borderRadius: 12, border: "1px solid #c7d2fe" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {pipelineData.map((entry, idx) => (
                    <Cell key={idx} fill={STAGE_COLORS[entry.stage] || "#818cf8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-sm text-indigo-300">No deals yet</div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-indigo-100 p-5 shadow-sm shadow-indigo-50">
          <h2 className="text-sm font-semibold text-indigo-900 mb-4">Contacts by Status</h2>
          {statusData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {statusData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #c7d2fe" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2">
                {statusData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-indigo-600">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm text-indigo-300">No contacts yet</div>
          )}
        </div>
      </div>

      {/* Quick links + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-indigo-100 p-5 shadow-sm shadow-indigo-50">
          <h2 className="text-sm font-semibold text-indigo-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "View Contacts", kind: "contacts" as const, desc: `${totalContacts} total`, icon: <Users className="h-4 w-4 text-indigo-500" /> },
              { label: "View Pipeline", kind: "deals" as const, desc: `${totalDeals} deals`, icon: <Handshake className="h-4 w-4 text-violet-500" /> },
              { label: "View Activities", kind: "activities" as const, desc: `${activities.length} logged`, icon: <Sparkles className="h-4 w-4 text-amber-500" /> },
            ].map((item) => (
              <button
                key={item.kind}
                onClick={() => onNavigate({ kind: item.kind })}
                className="text-left p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm transition-all group"
              >
                <div className="mb-2">{item.icon}</div>
                <p className="text-sm font-medium text-indigo-900 group-hover:text-indigo-700">{item.label}</p>
                <p className="text-xs text-indigo-400 mt-0.5">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-indigo-100 p-5 shadow-sm shadow-indigo-50">
          <h2 className="text-sm font-semibold text-indigo-900 mb-3">Recent Activity</h2>
          {recentActivities.length > 0 ? (
            <div className="flex flex-col gap-3">
              {recentActivities.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${TYPE_COLORS[a.type] || "bg-indigo-50 text-indigo-500"}`}>
                    {TYPE_ICONS[a.type] || <TrendingUp className="h-3.5 w-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-indigo-900 truncate">{a.description}</p>
                    <p className="text-xs text-indigo-400">{a.type} · {a.date ? dayjs(a.date).format("MMM D, h:mm A") : "No date"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-sm text-indigo-300">No activities yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
