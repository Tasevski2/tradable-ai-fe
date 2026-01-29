import Decimal from "decimal.js";

export function formatPrice(price: string | number): string {
  return new Decimal(price).toFixed(2);
}

export function formatPercent(value: string | number): string {
  return `${new Decimal(value).times(100).toFixed(2)}%`;
}

export function formatCurrency(value: string | number): string {
  return `$${formatPrice(value)}`;
}

export function formatNumber(value: string | number, decimals = 2): string {
  return new Decimal(value).toFixed(decimals);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
