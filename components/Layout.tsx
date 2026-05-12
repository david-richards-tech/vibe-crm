import React from "react";
import { type AppUser } from "../lib/auth";
import { type Page } from "../App";
import {
  LayoutDashboard,
  Users,
  Handshake,
  Activity,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS: { kind: Page["kind"]; label: string; icon: React.ReactNode }[] = [
  { kind: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { kind: "contacts", label: "Contacts", icon: <Users className="h-4 w-4" /> },
  { kind: "deals", label: "Deals", icon: <Handshake className="h-4 w-4" /> },
  { kind: "activities", label: "Activities", icon: <Activity className="h-4 w-4" /> },
];

interface LayoutProps {
  user: AppUser;
  page: Page;
  onNavigate: (p: Page) => void;
  onSignedOut: () => void;
  children: React.ReactNode;
}

export default function Layout({ user, page, onNavigate, onSignedOut, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const activeKind = page.kind === "contact-detail" ? "contacts" : page.kind;

  const navContent = (
    <nav className="flex flex-col gap-1 flex-1 px-3 pt-4">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.kind}
          onClick={() => {
            onNavigate({ kind: item.kind } as Page);
            setSidebarOpen(false);
          }}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
            activeKind === item.kind
              ? "bg-white/20 text-white shadow-sm backdrop-blur-sm"
              : "text-indigo-200 hover:bg-white/10 hover:text-white"
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );

  const logoSection = (
    <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
      <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)" }}>
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-8.514 4.5-19H7.5c0 10.486 2.015 19 4.5 19z" />
        </svg>
      </div>
      <span className="font-bold text-white text-lg tracking-tight">Pipeline</span>
    </div>
  );

  const userSection = (
    <div className="px-4 pb-4 pt-3 border-t border-white/10 mt-auto">
      <div className="flex items-center gap-2.5 mb-3 px-1">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-300 to-violet-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <span className="text-xs text-indigo-200 truncate flex-1">{user.email}</span>
      </div>
      <button
        onClick={onSignedOut}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-indigo-300 hover:bg-red-500/20 hover:text-red-200 transition-all w-full"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-indigo-50/30">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-indigo-900/20" style={{ background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 40%, #3730a3 100%)" }}>
        {logoSection}
        {navContent}
        {userSection}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 shadow-2xl z-50 flex flex-col" style={{ background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 40%, #3730a3 100%)" }}>
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <span className="font-bold text-white text-lg tracking-tight">Pipeline</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md hover:bg-white/10 text-indigo-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            {navContent}
            {userSection}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-indigo-100 bg-white/80 backdrop-blur-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-md hover:bg-indigo-50 text-indigo-600">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-8.514 4.5-19H7.5c0 10.486 2.015 19 4.5 19z" />
              </svg>
            </div>
            <span className="font-bold text-indigo-900 tracking-tight">Pipeline</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
