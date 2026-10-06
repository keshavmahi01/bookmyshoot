export function rupees(amount: number | null | undefined) {
  if (amount === null || amount === undefined) return "On request";
  return "₹" + amount.toLocaleString("en-IN");
}

export function shortRupees(amount: number) {
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return "₹" + (Number.isInteger(lakh) ? lakh : lakh.toFixed(1)) + "L";
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return "₹" + (Number.isInteger(k) ? k : k.toFixed(1)) + "k";
  }
  return "₹" + amount;
}

/** Local date as YYYY-MM-DD, no timezone surprises. */
export function toISODate(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function parseISODate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function prettyDate(s: string | null | undefined) {
  if (!s) return "";
  const d = parseISODate(s.slice(0, 10));
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function prettyDateTime(s: string | null | undefined) {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return prettyDate(s);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return hours === 1 ? "1 hr ago" : `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return days === 1 ? "1 day ago" : `${days} days ago`;
  return prettyDate(iso.slice(0, 10));
}

export function responseText(hours: number) {
  if (hours <= 1) return "Usually replies within an hour";
  if (hours <= 6) return `Usually replies in about ${hours} hours`;
  if (hours <= 24) return "Usually replies within a day";
  return "Replies in a day or two";
}

/** "Mohali, SAS Nagar district, Punjab", without repeating a name. */
export function placeLine(city: { name: string; district: string; state: string }) {
  const parts = [city.name];
  if (city.district !== city.name) parts.push(`${city.district} district`);
  if (city.state !== city.name && city.state !== city.district) parts.push(city.state);
  return parts.join(", ");
}
