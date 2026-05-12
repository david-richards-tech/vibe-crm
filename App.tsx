import React from "react";
import { getUser, logout, type AppUser } from "./lib/auth";
import { listOrgs, type Org } from "./lib/orgs";
import SignIn from "./pages/SignIn";
import OrgSetup from "./pages/OrgSetup";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import ContactDetail from "./pages/ContactDetail";
import Deals from "./pages/Deals";
import Activities from "./pages/Activities";

export type Page =
  | { kind: "dashboard" }
  | { kind: "contacts" }
  | { kind: "contact-detail"; contactId: string }
  | { kind: "deals" }
  | { kind: "activities" };

export default function App() {
  const [user, setUser] = React.useState<AppUser | null | undefined>(undefined);
  const [page, setPage] = React.useState<Page>({ kind: "dashboard" });

  // Org state
  const [activeOrgId, setActiveOrgId] = React.useState<string | null>(null);
  const [orgs, setOrgs] = React.useState<Org[]>([]);
  const [orgsLoaded, setOrgsLoaded] = React.useState(false);

  React.useEffect(() => {
    getUser().then(setUser);
  }, []);

  // Once signed in, load orgs
  React.useEffect(() => {
    if (!user) { setOrgsLoaded(false); return; }
    listOrgs().then((result) => {
      if (result) {
        setOrgs(result.orgs);
        setActiveOrgId(result.activeOrgId);
      }
      setOrgsLoaded(true);
    }).catch(() => setOrgsLoaded(true));
  }, [user]);

  const handleSignedOut = React.useCallback(async () => {
    await logout();
    setUser(null);
    setActiveOrgId(null);
    setOrgs([]);
    setOrgsLoaded(false);
  }, []);

  const navigate = React.useCallback((p: Page) => setPage(p), []);

  const handleOrgChanged = React.useCallback((newActiveOrgId: string | null, newOrgs: Org[]) => {
    setActiveOrgId(newActiveOrgId);
    setOrgs(newOrgs);
  }, []);

  // Loading: checking auth
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-6 w-6 border-2 border-slate-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return <SignIn onSignedIn={setUser} />;
  }

  // Signed in but orgs still loading
  if (!orgsLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-6 w-6 border-2 border-indigo-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Signed in but no active org — show org picker
  if (!activeOrgId) {
    return <OrgSetup onReady={handleOrgChanged} />;
  }

  // Signed in with active org — show the app
  return (
    <Layout
      user={user}
      page={page}
      onNavigate={navigate}
      onSignedOut={handleSignedOut}
      activeOrgId={activeOrgId}
      orgs={orgs}
      onOrgChanged={handleOrgChanged}
    >
      {page.kind === "dashboard" && <Dashboard onNavigate={navigate} />}
      {page.kind === "contacts" && <Contacts onNavigate={navigate} />}
      {page.kind === "contact-detail" && <ContactDetail contactId={page.contactId} onNavigate={navigate} />}
      {page.kind === "deals" && <Deals onNavigate={navigate} />}
      {page.kind === "activities" && <Activities onNavigate={navigate} />}
    </Layout>
  );
}
