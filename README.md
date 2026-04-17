# HMC Planning — /slantis

Planning coordination tool between /slantis team and HMC Architects — merges Odoo projects + HubSpot deals into an editable monthly planning table.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Auth | NextAuth.js v5 beta + Google OAuth |
| Styling | Tailwind CSS + /slantis brand (Space Grotesk, DM Sans, #FF7700) |
| Database | Turso (libSQL) via `@prisma/adapter-libsql` + Prisma 5 ORM |
| Local dev DB | SQLite file (`file:./dev.db`) |

---

## Open Tasks

- [ ] **Fix Odoo data loading** — visit `https://hmc-slantis.vercel.app/api/odoo/projects` (logged in) to see full error; fix `call_kw` request in `odoo.ts`; remove debug logs after fix
- [ ] Rename local folder `C:\Claude Code\hmc-capacity` → `C:\Claude Code\hmc-planning` (do manually after closing Claude session)
- [ ] Build user management admin UI (currently manual via Turso dashboard)
- [ ] Month visibility toggle UI (currently `hidden: true` in `months.ts` only)
- [ ] `prisma db push` already run (soldHrs + soSeeded columns applied to Turso)

---

## Dev Quickstart

```bash
cp .env.example .env   # fill in values
npm install
npm run dev            # → http://localhost:3000
```

---

## Session Log

### 2026-04-17
- Rebranded: Vercel `hmc-capacity` → `hmc-slantis`, GitHub → `hmc-planning`, page titles → "HMC Planning", domain → `hmc-slantis.vercel.app`
- NEXTAUTH_URL updated; Google OAuth redirect URI updated in GCP
- Column reorder: HS icon first, ODOO icon second; white SVG icons (HubSpot sprocket, Odoo circle)
- HubSpot: seed dates from `project_start_date`/`project_end_date`; SO lookup in Odoo by name for `odooSoUrl` + `soldHrs`
- Odoo rows: seed dates from linked project(s) via `project_ids` (min start / max end)
- Fixed critical Odoo auth bug: cookie now extracted from Set-Cookie and forwarded via `Cookie` header on all call_kw requests
- Fixed 2 TS build errors (Array.from for Map/Set iterators)
- **In progress:** Odoo data still not loading in UI — auth works, call_kw throws unknown error; `/api/odoo/projects` now exposes full error (next session: visit URL, read error, fix)

### 2026-04-16 (session 2)
- Group collapse/expand: all groups start collapsed; click header to toggle (▲/▼)
- Frozen header: two-table layout — black header card static above scrollable body div; JS syncs horizontal scroll
- Group cards: each group is a separate rounded card with colored header, bullet, name, count
- "H" → "Hrs" in monthly sub-header columns
- Effort Hrs: computed from sum of monthly hours (read-only); replaces manual Effort field
- Sold Hrs: new editable column; auto-seeded once from Odoo SO `x_studio_sold_hours` (soSeeded flag)
- Dates editable for all rows; Odoo rows seeded once from SO project start/end dates
- Color dot on Effort Hrs: 🟢≤5% · 🟡≤15% · 🔴>15% deviation from Sold Hrs
- Prisma schema: `soldHrs Float?` + `soSeeded Boolean @default(false)` added to ManualData
- **Pending:** `prisma db push` to apply schema to Turso

### 2026-04-16 (session 1)
- Registered project: memory file + registry entry created
- Cloned repo from `nmd-slantis/hmc-capacity`
- Documented full stack, env vars, file structure, DB schema, and open tasks
- Reviewed Vercel deployment history (8 deploys, latest READY on `cb35e12`)
- Confirmed only one branch exists (`claude/hmc-architects-home-page-wutmV`) — no `main`
- App is built and working; blocked only by missing Vercel credentials (Odoo + HubSpot)
- Planning/coordination session only — no code changes
