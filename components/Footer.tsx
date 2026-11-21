import Link from "next/link";
import { site } from "@/lib/site";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Safety", href: "/safety" },
      { label: "Contact & help", href: "/contact" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Ride", href: "/ride" },
      { label: "Drive", href: "/drive" },
      { label: "BarathGo for Business", href: "/business" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    title: "Apps",
    links: [
      { label: "Rider app", href: "/ride" },
      { label: "Driver app", href: "/driver" },
    ],
  },
  {
    title: "Partners",
    links: [
      { label: "Cooperatives & fleets", href: "/drive#cooperatives" },
      { label: "Corporate & PSU travel", href: "/business" },
      { label: "Pilgrimage & tours", href: "/services#pilgrimage" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <Link href="/" aria-label="BarathGo home">
            <Logo invert />
          </Link>
          <Link className="footer__help" href="/contact">
            Visit Help Center
          </Link>
        </div>
        <div className="footer__cols">
          {columns.map((column) => (
            <div key={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer__bottom">
          <span>
            © {new Date().getFullYear()} BarathGo · An initiative of{" "}
            <a href={site.parent.url} target="_blank" rel="noopener">
              {site.parent.legalName}
            </a>
          </span>
          <span className="footer__legal">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
