import { StockQuote } from "@/types";

export function formatPrice(price: number, currency = "USD"): string {
  const locale = currency === "EUR" ? "fr-FR" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatLargeNumber(num: number): string {
  if (Math.abs(num) >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toString();
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function isPositive(change: number): boolean {
  return change >= 0;
}

export function getPnlColor(value: number): string {
  return value >= 0 ? "text-accent-green" : "text-accent-red";
}

export function getPnlBgColor(value: number): string {
  return value >= 0
    ? "bg-accent-green/10 text-accent-green"
    : "bg-accent-red/10 text-accent-red";
}

export function getStockColor(quote: StockQuote): string {
  return isPositive(quote.change) ? "#00d4a3" : "#ff4c6a";
}

export function getPeriodLabel(period: string): string {
  const map: Record<string, string> = {
    "1D": "1 Jour",
    "1W": "1 Semaine",
    "1M": "1 Mois",
    "3M": "3 Mois",
    "6M": "6 Mois",
    "1Y": "1 An",
    "5Y": "5 Ans",
  };
  return map[period] || period;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
