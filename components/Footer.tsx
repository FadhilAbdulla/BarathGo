import Link from "next/link";
import { site } from "@/lib/site";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Ride",
    links: [
      { label: "Book a ride", href: "/book" },
      { label: "Ride options", href: "/services" },
      { label: "Fare estimate", href: "/book#fares" },
      { label: "Safety", href: "/safety" },
    ],
  },
  {
    title: "Partner",
    links: [
      { label: "Drive with BarathGo", href: "/drive" },
      { label: "Cooperatives & unions", href: "/drive#cooperatives" },
      { label: "BarathGo for Business", href: "/business" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact & support", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" aria-label="BarathGo home">
              <Logo invert />
            </Link>
            <p>{site.tagline} A community-first mobility platform launched under the {site.parent.legalName}.</p>
            <a className="footer-mail" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </div>
          {columns.map((column) => (
            <div key={column.title} className="footer-col">
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} BarathGo. All rights reserved.</span>
          <span>
            An initiative of{" "}
            <a href={site.parent.url} target="_blank" rel="noopener">
              {site.parent.name}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
