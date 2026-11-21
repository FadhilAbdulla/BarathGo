import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { pages, site } from "@/lib/site";
import "./globals.css";
import "./app.css";
import "./site.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: pages["/"].title, template: `%s | ${site.name}` },
  description: pages["/"].description,
  applicationName: site.name,
  authors: [{ name: site.parent.legalName }],
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
  openGraph: { type: "website", siteName: site.name, locale: site.locale, title: pages["/"].title, description: pages["/"].description, url: "/", images: [site.ogImage] },
  twitter: { card: "summary_large_image", images: [site.ogImage.url] },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
  appleWebApp: { capable: true, title: site.name, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#000000", width: "device-width", initialScale: 1, viewportFit: "cover" };

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  email: site.email,
  logo: `${site.url}/brand/barathgo-mark.svg`,
  description: site.description,
  parentOrganization: { "@type": "Organization", name: site.parent.legalName, url: site.parent.url },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <head>
        {/* Enables reveal animations only when JS runs; content is fully visible otherwise. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      </body>
    </html>
  );
}
