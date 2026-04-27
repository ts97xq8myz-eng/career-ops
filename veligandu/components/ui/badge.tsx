import { cn } from "@/lib/utils";

type Variant = "available" | "limited" | "unavailable" | "gold" | "ocean" | "promo";

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<Variant, string> = {
  available: "bg-green-100 text-green-800 border border-green-200",
  limited: "bg-amber-100 text-amber-800 border border-amber-200",
  unavailable: "bg-red-100 text-red-800 border border-red-200",
  gold: "bg-[var(--color-gold-pale)] text-[var(--color-gold-dark)] border border-[var(--color-gold)]",
  ocean: "bg-[var(--color-ocean)] text-white border border-[var(--color-ocean-light)]",
  promo: "bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white border-0",
};

const dotColors: Record<Variant, string> = {
  available: "bg-green-500",
  limited: "bg-amber-500",
  unavailable: "bg-red-500",
  gold: "bg-[var(--color-gold)]",
  ocean: "bg-white",
  promo: "bg-white",
};

export function Badge({ variant = "available", children, className, dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
