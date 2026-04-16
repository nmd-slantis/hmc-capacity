# HMC Capacity — /slantis

Capacity coordination tool between /slantis team and HMC Architects — merges Odoo projects + HubSpot deals into an editable monthly capacity table.

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

- [ ] Configure Odoo credentials in Vercel (`ODOO_URL`, `ODOO_DB`, `ODOO_USERNAME`, `ODOO_PASSWORD`)
- [ ] Configure HubSpot credentials in Vercel (`HUBSPOT_ACCESS_TOKEN`)
- [ ] Verify HubSpot pipeline/stage filter IDs (Service Pipeline + Closed Won)
- [ ] Build user management admin UI (currently manual via Turso dashboard)
- [ ] Verify SO column Odoo field names (`sale_order_id` / `analytic_account_id`)
- [ ] Month visibility toggle UI (currently `hidden: true` in `months.ts` only)
- [ ] Merge/rename `claude/hmc-architects-home-page-wutmV` branch to `main`

---

## Dev Quickstart

```bash
cp .env.example .env   # fill in values
npm install
npm run dev            # → http://localhost:3000
```

---

## Session Log

### 2026-04-16
- Registered project: memory file + registry entry created
- Cloned repo from `nmd-slantis/hmc-capacity`
- Documented full stack, env vars, file structure, DB schema, and open tasks
- Reviewed Vercel deployment history (8 deploys, latest READY on `cb35e12`)
- Confirmed only one branch exists (`claude/hmc-architects-home-page-wutmV`) — no `main`
- App is built and working; blocked only by missing Vercel credentials (Odoo + HubSpot)
- Planning/coordination session only — no code changes
