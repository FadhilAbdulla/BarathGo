import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header, type NavItem } from "@/components/Header";
import { RevealObserver } from "@/components/RevealObserver";
import { pages, primaryNav, site } from "@/lib/site";
import "./globals.css";
import "./components.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: pages["/"].title, template: `%s | ${site.name}` },
  description: pages["/"].description,
  applicationName: site.name,
  authors: [{ name: site.parent.legalName }],
  formatDetection: { telephone: false },
  openGraph: { type: "website", siteName: site.name, locale: site.locale, title: pages["/"].title, description: pages["/"].description, url: "/" },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#0c1b2b", width: "device-width", initialScale: 1, viewportFit: "cover" };

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  email: site.email,
  description: site.description,
  parentOrganization: { "@type": "Organization", name: site.parent.legalName, url: site.parent.url },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nav: NavItem[] = primaryNav.map((path) => ({ label: pages[path].label, href: path }));
  return (
    <html lang="en-IN" className={`${body.variable} ${display.variable}`}>
      <head>
        {/* Enables reveal animations only when JS runs; content is fully visible otherwise. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header nav={nav} />
        <main id="main">{children}</main>
        <Footer />
        <RevealObserver />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      </body>
    </html>
  );
}
