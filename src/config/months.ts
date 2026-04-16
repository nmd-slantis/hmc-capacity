export interface MonthConfig {
  key: string;              // e.g. "aug-25" — used as DB key in monthlyData JSON
  label: string;            // e.g. "Aug 25" — shown in column header
  workdayHours: number;     // Mon-Fri calendar days × 8 h (adjust for holidays as needed)
  quarterStart?: boolean;   // true → darker left border to mark quarter boundary
  hidden?: boolean;         // if true, column is not rendered (data is still preserved)
}

// To add a month: append one entry to this array.
// To hide a month: add hidden: true (data is preserved, just not displayed).
// Adjust workdayHours when local holidays reduce the available working time.
// No other file needs to change.
export const MONTHS: MonthConfig[] = [
  { key: "aug-25", label: "Aug 25", workdayHours: 168 },                          // 21 days
  { key: "sep-25", label: "Sep 25", workdayHours: 176 },                          // 22 days
  { key: "oct-25", label: "Oct 25", workdayHours: 184, quarterStart: true },      // 23 days — Q4 start
  { key: "nov-25", label: "Nov 25", workdayHours: 160 },                          // 20 days
  { key: "dec-25", label: "Dec 25", workdayHours: 184 },                          // 23 days
  { key: "jan-26", label: "Jan 26", workdayHours: 176, quarterStart: true },      // 22 days — Q1 start
  { key: "feb-26", label: "Feb 26", workdayHours: 160 },                          // 20 days
  { key: "mar-26", label: "Mar 26", workdayHours: 176 },                          // 22 days
  { key: "apr-26", label: "Apr 26", workdayHours: 176, quarterStart: true },      // 22 days — Q2 start
  { key: "may-26", label: "May 26", workdayHours: 168 },                          // 21 days
  { key: "jun-26", label: "Jun 26", workdayHours: 176 },                          // 22 days
  { key: "jul-26", label: "Jul 26", workdayHours: 184, quarterStart: true },      // 23 days — Q3 start
];

export const VISIBLE_MONTHS = MONTHS.filter((m) => !m.hidden);

export function hoursToFte(hours: number, monthHours: number): number {
  return Math.round((hours / monthHours) * 10) / 10;
}
