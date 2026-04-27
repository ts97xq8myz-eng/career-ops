import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  centered = false,
  light = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-12", centered && "text-center", className)}>
      {eyebrow && (
        <p
          className={cn(
            "text-sm font-semibold uppercase tracking-widest mb-3",
            light ? "text-[var(--color-gold-light)]" : "text-[var(--color-gold)]"
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight",
          light ? "text-white" : "text-[var(--color-ocean)]"
        )}
      >
        {title}
      </h2>
      {(eyebrow || true) && (
        <div
          className={cn(
            "h-0.5 w-16 mt-4 bg-[var(--color-gold)]",
            centered && "mx-auto"
          )}
        />
      )}
      {subtitle && (
        <p
          className={cn(
            "mt-6 text-lg max-w-2xl leading-relaxed",
            light ? "text-white/80" : "text-[var(--color-ocean-muted)]",
            centered && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
