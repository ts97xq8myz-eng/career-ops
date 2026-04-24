import { cn } from "@/lib/utils";
import Image from "next/image";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden",
        "transition-all duration-300 hover:shadow-[var(--shadow-hero)] hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ImageCardProps {
  imageSrc: string;
  imageAlt: string;
  badge?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function ImageCard({ imageSrc, imageAlt, badge, className, children, onClick }: ImageCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden group cursor-pointer",
        "transition-all duration-300 hover:shadow-[var(--shadow-hero)] hover:-translate-y-1",
        className
      )}
      onClick={onClick}
    >
      <div className="relative h-64 overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {badge && <div className="absolute top-3 left-3">{badge}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export function CardBody({ className, children }: CardProps) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
