import React from "react";
import { getUser, logout, type AppUser } from "./lib/auth";
import SignIn from "./pages/SignIn";
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

  React.useEffect(() => {
    getUser().then(setUser);
  }, []);

  const handleSignedOut = React.useCallback(async () => {
    await logout();
    setUser(null);
  }, []);

  const navigate = React.useCallback((p: Page) => setPage(p), []);

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-6 w-6 border-2 border-slate-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <SignIn onSignedIn={setUser} />;
  }

  return (
    <Layout user={user} page={page} onNavigate={navigate} onSignedOut={handleSignedOut}>
      {page.kind === "dashboard" && <Dashboard onNavigate={navigate} />}
      {page.kind === "contacts" && <Contacts onNavigate={navigate} />}
      {page.kind === "contact-detail" && <ContactDetail contactId={page.contactId} onNavigate={navigate} />}
      {page.kind === "deals" && <Deals onNavigate={navigate} />}
      {page.kind === "activities" && <Activities onNavigate={navigate} />}
    </Layout>
  );
}
