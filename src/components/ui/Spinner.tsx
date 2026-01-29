import { cn } from "@/lib/utils/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-1",
  md: "w-5 h-5 border-2",
  lg: "w-8 h-8 border-3",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "rounded-full animate-spin border-primary! border-t-transparent! border-l-transparent!",
        sizeClasses[size],
        className,
      )}
    />
  );
}
