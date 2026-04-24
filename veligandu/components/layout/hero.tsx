import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface HeroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  image: string;
  imageAlt?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  overlay?: "dark" | "ocean" | "none";
  height?: "full" | "large" | "medium";
  children?: React.ReactNode;
}

export function Hero({
  title,
  subtitle,
  eyebrow,
  image,
  imageAlt = "Veligandu Maldives",
  primaryCta,
  secondaryCta,
  overlay = "dark",
  height = "large",
  children,
}: HeroProps) {
  const overlayClass = {
    dark: "bg-gradient-to-b from-black/40 via-black/20 to-black/60",
    ocean: "bg-gradient-to-b from-[var(--color-ocean)]/60 via-[var(--color-ocean)]/20 to-[var(--color-ocean)]/70",
    none: "",
  }[overlay];

  const heightClass = {
    full: "min-h-screen",
    large: "min-h-[85vh]",
    medium: "min-h-[60vh]",
  }[height];

  return (
    <section className={`relative flex items-center ${heightClass}`}>
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className={`absolute inset-0 ${overlayClass}`} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl animate-fade-in">
          {eyebrow && (
            <p className="text-[var(--color-gold)] text-sm font-semibold uppercase tracking-widest mb-4">
              {eyebrow}
            </p>
          )}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
            {title}
          </h1>
          <div className="h-0.5 w-20 bg-[var(--color-gold)] mb-6" />
          {subtitle && (
            <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
              {subtitle}
            </p>
          )}
          {(primaryCta || secondaryCta) && (
            <div className="flex flex-wrap gap-4">
              {primaryCta && (
                <Link href={primaryCta.href}>
                  <Button variant="primary" size="xl">
                    {primaryCta.label}
                  </Button>
                </Link>
              )}
              {secondaryCta && (
                <Link href={secondaryCta.href}>
                  <Button variant="outline" size="xl">
                    {secondaryCta.label}
                  </Button>
                </Link>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image: string;
}

export function PageHero({ title, subtitle, image }: PageHeroProps) {
  return (
    <Hero
      title={title}
      subtitle={subtitle}
      image={image}
      overlay="ocean"
      height="medium"
    />
  );
}
