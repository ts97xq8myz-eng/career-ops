"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/villas", label: "Villas" },
  { href: "/offers", label: "Offers" },
  { href: "/experiences", label: "Experiences" },
  { href: "/dining", label: "Dining" },
  { href: "/transfers", label: "Transfers" },
];

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+9609999999";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--color-ocean)] shadow-[var(--shadow-card)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-serif text-xl font-bold text-white">VELIGANDU</span>
            <span className="text-[var(--color-gold)] text-xs tracking-[0.3em] uppercase">Maldives</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/90 hover:text-[var(--color-gold)] text-sm font-medium transition-colors duration-200 tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={`https://wa.me/${WHATSAPP.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-white/80 hover:text-[var(--color-gold)] text-sm transition-colors duration-200"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden lg:inline">WhatsApp</span>
            </a>
            <Link href="/book">
              <Button variant="primary" size="md">
                Book Direct
              </Button>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[var(--color-ocean)] border-t border-white/10 px-4 pb-6">
          <nav className="flex flex-col gap-4 pt-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-white/90 hover:text-[var(--color-gold)] font-medium py-1 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/book" onClick={() => setOpen(false)}>
              <Button variant="primary" size="md" fullWidth>
                Book Direct
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
