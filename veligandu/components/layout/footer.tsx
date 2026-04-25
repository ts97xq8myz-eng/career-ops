import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

const EMAIL    = process.env.NEXT_PUBLIC_RESORT_EMAIL    ?? "veligandu@reservationsandsales.com";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+9607779519";
const PHONE    = process.env.NEXT_PUBLIC_RESORT_PHONE    ?? "+960 666 0519";

export function Footer() {
  return (
    <footer className="bg-[var(--color-ocean-dark)] text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            {/* Brand lockup: small R&S logo → big VELIGANDU */}
            <div className="flex flex-col gap-1 mb-5">
              {/* R&S — small, secondary */}
              <Image
                src="/rs-logo.svg"
                alt="Reservations & Sales"
                width={100}
                height={28}
                className="h-6 w-auto opacity-50 brightness-0 invert"
              />
              {/* Veligandu — large, primary */}
              <div className="flex flex-col leading-none mt-1">
                <span className="font-serif text-3xl font-bold text-white leading-tight">VELIGANDU</span>
                <span className="text-[var(--color-gold)] text-[10px] tracking-[0.35em] uppercase font-medium">Island Resort · Maldives</span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-white/55 max-w-sm mb-6">
              An intimate island paradise in the heart of the Indian Ocean.
              Where every villa floats above turquoise waters and every sunset
              belongs to you alone. Reservations managed exclusively by
              Reservations &amp; Sales.
            </p>

            {/* Contact details */}
            <div className="flex flex-col gap-3 text-sm">
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-2 hover:text-[var(--color-gold)] transition-colors duration-200"
              >
                <Mail className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0" />
                {EMAIL}
              </a>
              <a
                href={`https://wa.me/${WHATSAPP.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[var(--color-gold)] transition-colors duration-200"
              >
                <Phone className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0" />
                WhatsApp: {WHATSAPP}
              </a>
              <a
                href={`tel:${PHONE.replace(/\s/g, "")}`}
                className="flex items-center gap-2 hover:text-[var(--color-gold)] transition-colors duration-200"
              >
                <Phone className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0" />
                Resort: {PHONE}
              </a>
              <span className="flex items-start gap-2 text-white/50">
                <MapPin className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0 mt-0.5" />
                Veligandu Island, Rasdhoo Atoll,<br />
                Alifu Dhaalu, Republic of Maldives
              </span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-5">Explore</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {[
                { href: "/villas",       label: "Our Villas" },
                { href: "/offers",       label: "Special Offers" },
                { href: "/experiences",  label: "Experiences" },
                { href: "/dining",       label: "Dining" },
                { href: "/transfers",    label: "Getting Here" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[var(--color-gold)] transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Booking */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-5">Legal &amp; Booking</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {[
                { href: "/book",         label: "Book Your Stay" },
                { href: "/offers",       label: "Current Offers" },
                { href: "/terms",        label: "Terms & Conditions" },
                { href: "/privacy",      label: "Privacy Policy" },
                { href: "/cancellation", label: "Cancellation Policy" },
                { href: "/admin/login",  label: "Staff Portal" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[var(--color-gold)] transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://www.reservationsandsales.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-[var(--color-gold)] transition-colors duration-200"
                >
                  Reservations &amp; Sales
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/35">
          <p>
            © {new Date().getFullYear()} Veligandu Island Resort · Managed by Reservations &amp; Sales.
            All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/cancellation" className="hover:text-white/60 transition-colors">Cancellations</Link>
            <span className="text-white/20">|</span>
            <span>Book direct — best rate guaranteed.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
