"use client";

import { MessageCircle } from "lucide-react";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+9609999999";

export function WhatsAppCTA() {
  const href = `https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent("Hello, I would like to enquire about a stay at Veligandu Maldives.")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="hidden sm:inline text-sm">Chat with Us</span>
    </a>
  );
}
