export type WeightFilter = 'week' | 'month' | 'quarter' | 'semester' | 'year' | 'ytd';

export interface WindowRange {
  from: string; // 'YYYY-MM-DD' (incluido)
  to: string; // 'YYYY-MM-DD' (incluido)
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// Lunes como inicio de semana (ISO). Día 0 (domingo) → 6 días atrás.
function startOfIsoWeek(d: Date): Date {
  const result = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = result.getDay();
  const daysFromMonday = (day + 6) % 7; // lun=0, mar=1, ..., dom=6
  result.setDate(result.getDate() - daysFromMonday);
  return result;
}

function endOfMonth(year: number, monthIndex: number): Date {
  return new Date(year, monthIndex + 1, 0);
}

function weekRange(anchor: Date, offsetUnits: number): WindowRange {
  const monday = startOfIsoWeek(anchor);
  monday.setDate(monday.getDate() + offsetUnits * 7);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return { from: formatLocalDate(monday), to: formatLocalDate(sunday) };
}

function monthRange(anchor: Date, offsetUnits: number): WindowRange {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const targetMonthIndex = month + offsetUnits;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const start = new Date(targetYear, targetMonth, 1);
  const end = endOfMonth(targetYear, targetMonth);
  return { from: formatLocalDate(start), to: formatLocalDate(end) };
}

function quarterRange(anchor: Date, offsetUnits: number): WindowRange {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const quarterIndex = Math.floor(month / 3);
  const targetQuarterIndex = quarterIndex + offsetUnits;
  const targetYear = year + Math.floor(targetQuarterIndex / 4);
  const targetQuarter = ((targetQuarterIndex % 4) + 4) % 4;
  const startMonth = targetQuarter * 3;
  const start = new Date(targetYear, startMonth, 1);
  const end = endOfMonth(targetYear, startMonth + 2);
  return { from: formatLocalDate(start), to: formatLocalDate(end) };
}

function semesterRange(anchor: Date, offsetUnits: number): WindowRange {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const semesterIndex = Math.floor(month / 6);
  const targetSemesterIndex = semesterIndex + offsetUnits;
  const targetYear = year + Math.floor(targetSemesterIndex / 2);
  const targetSemester = ((targetSemesterIndex % 2) + 2) % 2;
  const startMonth = targetSemester * 6;
  const start = new Date(targetYear, startMonth, 1);
  const end = endOfMonth(targetYear, startMonth + 5);
  return { from: formatLocalDate(start), to: formatLocalDate(end) };
}

function yearRange(anchor: Date, offsetUnits: number): WindowRange {
  const targetYear = anchor.getFullYear() + offsetUnits;
  const start = new Date(targetYear, 0, 1);
  const end = new Date(targetYear, 11, 31);
  return { from: formatLocalDate(start), to: formatLocalDate(end) };
}

function ytdRange(anchor: Date): WindowRange {
  const start = new Date(anchor.getFullYear(), 0, 1);
  return { from: formatLocalDate(start), to: formatLocalDate(anchor) };
}

export function computeWindowRange(
  filter: WeightFilter,
  anchor: Date,
  offsetUnits: number,
): WindowRange {
  switch (filter) {
    case 'week':
      return weekRange(anchor, offsetUnits);
    case 'month':
      return monthRange(anchor, offsetUnits);
    case 'quarter':
      return quarterRange(anchor, offsetUnits);
    case 'semester':
      return semesterRange(anchor, offsetUnits);
    case 'year':
      return yearRange(anchor, offsetUnits);
    case 'ytd':
      return ytdRange(anchor);
  }
}

export function isLatestWindow(range: WindowRange, today: Date): boolean {
  const todayStr = formatLocalDate(today);
  return range.from <= todayStr && todayStr <= range.to;
}
