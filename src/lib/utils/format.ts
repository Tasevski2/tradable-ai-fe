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

export function formatCompactCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (Math.abs(num) < 1000) {
    return `$${num.toFixed(2)}`;
  }

  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  });

  return `$${formatter.format(num)}`;
}

export function formatNumber(value: string | number, decimals = 2): string {
  return new Decimal(value).toFixed(decimals);
}

export function formatPnlPercent(value: string | number): string {
  const decimal = new Decimal(value);
  const rounded = decimal.toDecimalPlaces(4);
  const sign = decimal.isPositive() && !decimal.isZero() ? "+" : "";
  return `${sign}${rounded.toString()}%`;
}

export function formatValue(value: string | number): string {
  const decimal = new Decimal(value);
  const abs = decimal.abs();

  if (abs.lt(1) && !abs.isZero()) {
    return decimal.toDecimalPlaces(6).toString();
  }

  return decimal.toDecimalPlaces(2).toString();
}

export function formatCompactValue(value: string | number): string {
  const decimal = new Decimal(value);
  const abs = decimal.abs();

  if (abs.gte(1_000_000_000)) {
    return `${decimal.div(1_000_000_000).toDecimalPlaces(2)}B`;
  }
  if (abs.gte(1_000_000)) {
    return `${decimal.div(1_000_000).toDecimalPlaces(2)}M`;
  }
  if (abs.gte(1_000)) {
    return `${decimal.div(1_000).toDecimalPlaces(1)}K`;
  }

  return formatValue(value);
}

export function formatPercentDisplay(value: string | number): string {
  const decimal = new Decimal(value);
  return `${decimal.toDecimalPlaces(2).toString()}%`;
}

export function formatRatio(value: string | number): string {
  return new Decimal(value).toDecimalPlaces(2).toString();
}

export function formatMinutes(value: string | number): string {
  return `${new Decimal(value).toDecimalPlaces(1).toString()} min`;
}

/**
 * Smart duration formatter that converts minutes to hours or days when appropriate.
 * - < 60 min: shows minutes (e.g., "45.5 min")
 * - 60-1440 min: shows hours (e.g., "2.5 hours")
 * - > 1440 min: shows days (e.g., "1.5 days")
 */
export function formatDuration(minutes: string | number): string {
  const mins = new Decimal(minutes);

  // Less than 60 minutes: show minutes
  if (mins.lt(60)) {
    return `${mins.toDecimalPlaces(1).toString()} min`;
  }

  // Less than 24 hours (1440 min): show hours
  if (mins.lt(1440)) {
    const hours = mins.div(60);
    return `${hours.toDecimalPlaces(1).toString()} hours`;
  }

  // 24+ hours: show days
  const days = mins.div(1440);
  return `${days.toDecimalPlaces(1).toString()} days`;
}

/**
 * Smart currency formatter that shows significant digits for small values.
 * - Values >= 1: 2 decimal places (e.g., "$123.45")
 * - Values < 1: Shows N significant digits after leading zeros (e.g., "$0.00367")
 *
 * @param value - The numeric value to format
 * @param significantDigits - Number of significant digits to show for small values (default: 3)
 */
export function formatSmartCurrency(
  value: string | number,
  significantDigits = 3
): string {
  const decimal = new Decimal(value);
  const abs = decimal.abs();

  // For values >= 1, use standard 2 decimal places
  if (abs.gte(1)) {
    return `$${decimal.toDecimalPlaces(2).toString()}`;
  }

  // For zero, just return $0.00
  if (abs.isZero()) {
    return "$0.00";
  }

  // For small values, find significant digits
  // Count leading zeros after decimal point, then show 3 significant digits
  const absStr = abs.toString();
  const decimalIndex = absStr.indexOf(".");

  if (decimalIndex === -1) {
    return `$${decimal.toDecimalPlaces(2).toString()}`;
  }

  // Find first non-zero digit position after decimal
  let leadingZeros = 0;
  for (let i = decimalIndex + 1; i < absStr.length; i++) {
    if (absStr[i] === "0") {
      leadingZeros++;
    } else {
      break;
    }
  }

  // Show N significant digits: leadingZeros + significantDigits
  const precision = Math.max(2, leadingZeros + significantDigits);
  return `$${decimal.toDecimalPlaces(precision).toString()}`;
}

/**
 * Format a date string for display (e.g., "Jan 15, 2024, 10:30 AM")
 */
export function formatDateTime(dateString: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
