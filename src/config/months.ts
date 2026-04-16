export interface MonthConfig {
  key: string;              // e.g. "oct-25" — used as DB key in monthlyData JSON
  label: string;            // e.g. "Oct 25" — shown in column header
  workdayHours: number;     // Mon-Fri calendar days × 8 h (adjust for holidays as needed)
  quarterStart?: boolean;   // true → darker left border to mark quarter boundary
  hidden?: boolean;         // if true, column is not rendered (data is still preserved)
}

// Months span complete quarters only.
// To add a month: append one entry to this array.
// To hide a month: add hidden: true (data is preserved, just not displayed).
// Adjust workdayHours when local holidays reduce the available working time.
export const MONTHS: MonthConfig[] = [
  // Q4 2025
  { key: "oct-25", label: "Oct 25", workdayHours: 184, quarterStart: true },  // 23 days
  { key: "nov-25", label: "Nov 25", workdayHours: 160 },                      // 20 days
  { key: "dec-25", label: "Dec 25", workdayHours: 184 },                      // 23 days
  // Q1 2026
  { key: "jan-26", label: "Jan 26", workdayHours: 176, quarterStart: true },  // 22 days
  { key: "feb-26", label: "Feb 26", workdayHours: 160 },                      // 20 days
  { key: "mar-26", label: "Mar 26", workdayHours: 176 },                      // 22 days
  // Q2 2026
  { key: "apr-26", label: "Apr 26", workdayHours: 176, quarterStart: true },  // 22 days
  { key: "may-26", label: "May 26", workdayHours: 168 },                      // 21 days
  { key: "jun-26", label: "Jun 26", workdayHours: 176 },                      // 22 days
  // Q3 2026
  { key: "jul-26", label: "Jul 26", workdayHours: 184, quarterStart: true },  // 23 days
  { key: "aug-26", label: "Aug 26", workdayHours: 168 },                      // 21 days
  { key: "sep-26", label: "Sep 26", workdayHours: 176 },                      // 22 days
];

export const VISIBLE_MONTHS = MONTHS.filter((m) => !m.hidden);

export function hoursToFte(hours: number, monthHours: number): number {
  return Math.round((hours / monthHours) * 10) / 10;
}
