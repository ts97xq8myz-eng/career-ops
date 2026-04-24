import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const EMAIL = process.env.NEXT_PUBLIC_RESORT_EMAIL ?? "reservations@veligandu.com";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+9609999999";

export function Footer() {
  return (
    <footer className="bg-[var(--color-ocean-dark)] text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <span className="font-serif text-2xl font-bold text-white block">VELIGANDU</span>
              <span className="text-[var(--color-gold)] text-xs tracking-[0.3em] uppercase">Island Resort · Maldives</span>
            </div>
            <p className="text-sm leading-relaxed text-white/60 max-w-sm">
              An intimate island paradise in the heart of the Indian Ocean. Where every villa floats above turquoise waters and every sunset is yours alone.
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm">
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 hover:text-[var(--color-gold)] transition-colors duration-200">
                <Mail className="w-4 h-4 text-[var(--color-gold)]" />
                {EMAIL}
              </a>
              <a href={`https://wa.me/${WHATSAPP.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[var(--color-gold)] transition-colors duration-200">
                <Phone className="w-4 h-4 text-[var(--color-gold)]" />
                {WHATSAPP}
              </a>
              <span className="flex items-center gap-2 text-white/60">
                <MapPin className="w-4 h-4 text-[var(--color-gold)]" />
                Rasdhoo Atoll, North Ari Atoll, Maldives
              </span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">Explore</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {[
                { href: "/villas", label: "Our Villas" },
                { href: "/offers", label: "Special Offers" },
                { href: "/experiences", label: "Experiences" },
                { href: "/dining", label: "Dining" },
                { href: "/transfers", label: "Getting Here" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[var(--color-gold)] transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Book */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">Direct Booking</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {[
                { href: "/book", label: "Book Your Stay" },
                { href: "/book", label: "Request a Quote" },
                { href: "/villas", label: "Overwater Villas" },
                { href: "/villas", label: "Beach Villas" },
                { href: "/admin/login", label: "Resort Login" },
              ].map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link href={link.href} className="hover:text-[var(--color-gold)] transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Veligandu Island Resort. All rights reserved.</p>
          <p>Book direct for the best available rate — guaranteed.</p>
        </div>
      </div>
    </footer>
  );
}
