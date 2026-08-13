export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(Number(value || 0));
}

export function normalizeDigits(value: string): string {
  return String(value || '').replace(/\D/g, '');
}

export function formatDate(dateValue: string | Date): string {
  const d = typeof dateValue === 'string' ? new Date(`${dateValue}T00:00:00`) : dateValue;
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Membentuk YYYY-MM-DD dari komponen tanggal lokal.
 * Tidak menggunakan toISOString() agar tanggal tidak bergeser satu hari di zona waktu UTC+.
 */
export function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToLocalDate(offsetDays: number, baseDate = new Date()): string {
  const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  date.setDate(date.getDate() + offsetDays);
  return toLocalIsoDate(date);
}

export function calculatePolicyEnd(startDate: string): string {
  const d = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  d.setFullYear(d.getFullYear() + 1);
  d.setDate(d.getDate() - 1);
  return toLocalIsoDate(d);
}

export function maskIdentity(value: string): string {
  if (!value) return '-';
  const clean = normalizeDigits(value);
  if (clean.length < 6) return clean;
  return `${clean.slice(0, 4)}••••••${clean.slice(-4)}`;
}
