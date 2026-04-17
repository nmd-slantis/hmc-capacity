import * as xmlrpc from 'xmlrpc';

export interface OdooProject {
  id: number;
  name: string;
  date_start: string | false;
  date: string | false;
  partner_id: [number, string] | false;
  last_update_status: string;
  sale_order_id?: [number, string] | false;
  analytic_account_id?: [number, string] | false;
}

export interface OdooSoData {
  id: number;
  name?: string;
  project_ids?: number[];
  x_studio_sold_hours: number | false | null;
  x_studio_project_start_date: string | false | null;
  x_studio_project_end_date: string | false | null;
  date_order?: string | false | null;
}

export interface OdooProjectDates {
  id: number;
  date_start: string | false | null;
  date: string | false | null;
}

function rpc(path: string, method: string, params: unknown[]): Promise<unknown> {
  const url = new URL(process.env.ODOO_URL!);
  const port = url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 80);
  const clientFn = url.protocol === 'https:' ? xmlrpc.createSecureClient : xmlrpc.createClient;
  const client = clientFn({ host: url.hostname, port, path });
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).methodCall(method, params, (err: Error | null, val: unknown) => {
      if (err) reject(new Error(String(err)));
      else resolve(val);
    });
  });
}

async function authenticate(): Promise<number> {
  const uid = await rpc('/xmlrpc/2/common', 'authenticate', [
    process.env.ODOO_DB,
    process.env.ODOO_USERNAME,
    process.env.ODOO_API_KEY,
    {},
  ]);
  if (typeof uid !== 'number' || !uid) throw new Error(`Odoo auth failed: uid=${String(uid)}`);
  return uid;
}

async function executeKw(
  uid: number,
  model: string,
  method: string,
  args: unknown[],
  kwargs: Record<string, unknown>,
): Promise<unknown> {
  return rpc('/xmlrpc/2/object', 'execute_kw', [
    process.env.ODOO_DB,
    uid,
    process.env.ODOO_API_KEY,
    model,
    method,
    args,
    kwargs,
  ]);
}

export async function fetchOdooProjects(): Promise<OdooProject[]> {
  const uid = await authenticate();
  const result = await executeKw(uid, 'project.project', 'search_read',
    [[['partner_id.name', '=', 'HMC Architects']]],
    { fields: ['id', 'name', 'date_start', 'date', 'partner_id', 'last_update_status', 'sale_order_id', 'analytic_account_id'], context: { lang: 'en_US', tz: 'UTC' } },
  );
  return (result as OdooProject[]) ?? [];
}

export function extractSoNumber(project: OdooProject): string | null {
  if (project.sale_order_id && Array.isArray(project.sale_order_id)) {
    return project.sale_order_id[1] ?? null;
  }
  return null;
}

export async function fetchOdooSosByNames(names: string[]): Promise<Map<string, OdooSoData>> {
  if (!names.length) return new Map();
  const uid = await authenticate();
  const result = await executeKw(uid, 'sale.order', 'search_read',
    [[['name', 'in', names]]],
    { fields: ['id', 'name', 'project_ids', 'x_studio_sold_hours', 'x_studio_project_start_date', 'x_studio_project_end_date', 'date_order'], context: { lang: 'en_US', tz: 'UTC' } },
  );
  const map = new Map<string, OdooSoData>();
  for (const so of (result as (OdooSoData & { name: string })[]) ?? []) map.set(so.name, so);
  return map;
}

export async function fetchOdooSoDetails(soIds: number[]): Promise<Map<number, OdooSoData>> {
  if (!soIds.length) return new Map();
  const uid = await authenticate();
  const result = await executeKw(uid, 'sale.order', 'search_read',
    [[['id', 'in', soIds]]],
    { fields: ['id', 'x_studio_sold_hours', 'x_studio_project_start_date', 'x_studio_project_end_date'], context: { lang: 'en_US', tz: 'UTC' } },
  );
  const map = new Map<number, OdooSoData>();
  for (const so of (result as OdooSoData[]) ?? []) map.set(so.id, so);
  return map;
}

export async function fetchOdooProjectDates(projectIds: number[]): Promise<Map<number, OdooProjectDates>> {
  if (!projectIds.length) return new Map();
  const uid = await authenticate();
  const result = await executeKw(uid, 'project.project', 'search_read',
    [[['id', 'in', projectIds]]],
    { fields: ['id', 'date_start', 'date'], context: { lang: 'en_US', tz: 'UTC' } },
  );
  const map = new Map<number, OdooProjectDates>();
  for (const p of (result as OdooProjectDates[]) ?? []) map.set(p.id, p);
  return map;
}
