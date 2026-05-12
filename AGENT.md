# Pipeline CRM — Architecture Notes

## Data Model
All tables are **org-scoped** (shared within an org; members see same rows, non-members can't).

- **contacts**: name, email, phone, company, title, status (Lead/Prospect/Customer/Churned), source, notes
- **deals**: title, value, stage (Prospecting→Qualification→Proposal→Negotiation→Closed Won/Lost), contact_id, probability, expected_close_date, notes
- **activities**: type (Call/Email/Meeting/Note), description, contact_id, deal_id, date

## Navigation
Simple state-based routing via `Page` union type in App.tsx — no URL router.
Pages: Dashboard, Contacts, ContactDetail, Deals, Activities.

## Auth & Org Flow
Email + 6-digit code flow. App.tsx gates everything on `getUser()`.
After sign-in, App.tsx checks for an active org via `listOrgs()`.
If no active org, the user sees `OrgSetup` page (create or join an org).
Without an active org, org-scoped tables return empty / inserts fail — this is the critical gating.

### Org lifecycle
1. `listOrgs()` returns `{ orgs, activeOrgId }` — checked on mount after auth
2. No active org → render `/pages/OrgSetup.tsx` (full-screen org picker/creator)
3. User creates org via `createOrg()` → auto-set as active → app loads
4. User switches org via `OrgPicker` in sidebar → `switchOrg()` → refresh data
5. Org membership is on the session cookie — `listRows`/`insertRow` auto-scope

### Org management UI
- `/pages/OrgSetup.tsx` — shown when no active org (sign-in → org setup → app)
- `/components/OrgPicker.tsx` — dropdown in sidebar to switch/create orgs

## Key Patterns
- All data access through `/lib/api.ts` (listRows, insertRow, updateRow, deleteRow)
- Forms use Radix Dialog primitives + Tailwind styling
- Static imports only — no `React.lazy` / dynamic `import()` (browser Babel runtime can't resolve relative specifiers)
- Responsive sidebar (desktop: persistent, mobile: overlay with hamburger)
- Recharts for Dashboard visualizations (BarChart, PieChart)
- Dayjs for date formatting

## Component Structure
- `/components/Layout.tsx` — sidebar + content shell (includes OrgPicker)
- `/components/OrgPicker.tsx` — sidebar dropdown to switch/create orgs
- `/components/ContactForm.tsx`, `DealForm.tsx`, `ActivityForm.tsx` — modal CRUD forms
- `/components/StatCard.tsx` — dashboard metric card
- `/pages/OrgSetup.tsx` — full-screen org picker (shown when no active org)
- `/pages/Dashboard.tsx` — metrics + charts + recent activity
- `/pages/Contacts.tsx` — searchable/filterable contact list table
- `/pages/ContactDetail.tsx` — single contact view with related deals + activities
- `/pages/Deals.tsx` — Kanban pipeline board with drag-to-move-stage
- `/pages/Activities.tsx` — timeline view grouped by date
