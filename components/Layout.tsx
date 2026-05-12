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
    <nav className="flex flex-col gap-1 flex-1 px-3 pt-2">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.kind}
          onClick={() => {
            onNavigate({ kind: item.kind } as Page);
            setSidebarOpen(false);
          }}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            activeKind === item.kind
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-slate-200 bg-white">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">
          <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-8.514 4.5-19H7.5c0 10.486 2.015 19 4.5 19z" />
            </svg>
          </div>
          <span className="font-bold text-slate-900">Pipeline CRM</span>
        </div>
        {navContent}
        <div className="px-4 pb-4 pt-2 border-t border-slate-200 mt-auto">
          <div className="flex items-center gap-2 mb-3 px-2">
            <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-slate-500 truncate flex-1">{user.email}</span>
          </div>
          <button
            onClick={onSignedOut}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
              <span className="font-bold text-slate-900">Pipeline CRM</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            {navContent}
            <div className="px-4 pb-4 pt-2 border-t border-slate-200 mt-auto">
              <div className="text-xs text-slate-500 px-2 mb-2 truncate">{user.email}</div>
              <button
                onClick={onSignedOut}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white">
          <button onClick={() => setSidebarOpen(true)} className="p-1 rounded-md hover:bg-slate-100">
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          <span className="font-bold text-slate-900">Pipeline CRM</span>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
