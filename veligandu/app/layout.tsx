import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppCTA } from "@/components/whatsapp-cta";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const GTAG_ID = process.env.NEXT_PUBLIC_GTAG_ID ?? "";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

export const metadata: Metadata = {
  metadataBase: new URL("https://veligandumaldives.reservationsandsales.com"),
  title: {
    default: "Veligandu Maldives — Direct Booking | Reservations & Sales",
    template: "%s | Veligandu Maldives · Reservations & Sales",
  },
  description:
    "Book direct at Veligandu Island Resort, Maldives. Exclusive rates on overwater villas, beach villas and honeymoon suites. Managed by Reservations & Sales — your Maldives specialists.",
  keywords: [
    "Veligandu Island Resort",
    "Veligandu Maldives",
    "Reservations and Sales",
    "Maldives direct booking",
    "overwater villa Maldives",
    "North Ari Atoll",
    "Maldives honeymoon",
    "luxury Maldives resort",
    "Rasdhoo Atoll",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://veligandumaldives.reservationsandsales.com",
    siteName: "Veligandu Maldives · Reservations & Sales",
    title: "Veligandu Maldives — Direct Booking | Reservations & Sales",
    description:
      "Book direct for the best rate. Overwater villas and beach villas managed exclusively by Reservations & Sales.",
    images: [
      {
        url: "https://lh3.googleusercontent.com/places/ANXAkqE-K0E7FqXZiimT71mUNuRYKokrRTx1MsTObRhxYjKqw3YIVPSF1wQZ6CnPCM8KXU_gKIVpYJ73JtfY0utYewUF7Xn3Wicu2Pw=s1200-w1200",
        width: 1200,
        height: 630,
        alt: "Veligandu Island Resort — Overwater Villa, Maldives",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Veligandu Maldives | Reservations & Sales",
    description: "Direct booking — best rate guaranteed. Overwater villas in the Indian Ocean.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        {/* Hotel Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LodgingBusiness",
              name: "Veligandu Island Resort",
              alternateName: "Veligandu Maldives",
              description: "Luxury overwater and beach villa resort in the Maldives, managed by Reservations & Sales.",
              url: "https://veligandumaldives.reservationsandsales.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Veligandu Island, Rasdhoo Atoll",
                addressLocality: "Alifu Dhaalu",
                addressRegion: "North Ari Atoll",
                addressCountry: "MV",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: "4.0167",
                longitude: "72.9833",
              },
              starRating: { "@type": "Rating", ratingValue: "5" },
              telephone: process.env.NEXT_PUBLIC_RESORT_PHONE ?? "+9606660519",
              email: process.env.NEXT_PUBLIC_RESORT_EMAIL ?? "veligandu@reservationsandsales.com",
              sameAs: [
                "https://www.reservationsandsales.com",
              ],
            }),
          }}
        />
        {/* Meta Pixel */}
        {META_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');
              `,
            }}
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Google Analytics */}
        {GTAG_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`} strategy="afterInteractive" />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GTAG_ID}');`}
            </Script>
          </>
        )}
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppCTA />
      </body>
    </html>
  );
}
