import { Skeleton } from "@/components/ui/Skeleton";

interface TableBodySkeletonProps {
  rows?: number;
  columns: number;
}

/**
 * Renders a `<tbody>` placeholder for data tables where every cell has the
 * same uniform dimensions (uniform-width tables such as trades and orders).
 * For tables with per-column varying widths, keep a local skeleton component.
 */
export function TableBodySkeleton({ rows = 10, columns }: TableBodySkeletonProps) {
  return (
    <tbody>
      {[...Array(rows)].map((_, i) => (
        <tr key={i}>
          {[...Array(columns)].map((_, j) => (
            <td key={j}>
              <Skeleton className="h-5 w-20 bg-background-overlay" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
