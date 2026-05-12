# Pipeline CRM — Architecture Notes

## Data Model
All tables are **company-scoped** (shared across all users of the app).

- **contacts**: name, email, phone, company, title, status (Lead/Prospect/Customer/Churned), source, notes
- **deals**: title, value, stage (Prospecting→Qualification→Proposal→Negotiation→Closed Won/Lost), contact_id, probability, expected_close_date, notes
- **activities**: type (Call/Email/Meeting/Note), description, contact_id, deal_id, date

## Navigation
Simple state-based routing via `Page` union type in App.tsx — no URL router.
Pages: Dashboard, Contacts, ContactDetail, Deals, Activities.

## Auth
Email + 6-digit code flow. App.tsx gates everything on `getUser()`.
SignIn page handles sendCode → verifyCode flow.

## Key Patterns
- All data access through `/lib/api.ts` (listRows, insertRow, updateRow, deleteRow)
- Forms use Radix Dialog primitives + Tailwind styling
- Static imports only — no `React.lazy` / dynamic `import()` (browser Babel runtime can't resolve relative specifiers)
- Responsive sidebar (desktop: persistent, mobile: overlay with hamburger)
- Recharts for Dashboard visualizations (BarChart, PieChart)
- Dayjs for date formatting

## Component Structure
- `/components/Layout.tsx` — sidebar + content shell
- `/components/ContactForm.tsx`, `DealForm.tsx`, `ActivityForm.tsx` — modal CRUD forms
- `/components/StatCard.tsx` — dashboard metric card
- `/pages/Dashboard.tsx` — metrics + charts + recent activity
- `/pages/Contacts.tsx` — searchable/filterable contact list table
- `/pages/ContactDetail.tsx` — single contact view with related deals + activities
- `/pages/Deals.tsx` — Kanban pipeline board with drag-to-move-stage
- `/pages/Activities.tsx` — timeline view grouped by date
