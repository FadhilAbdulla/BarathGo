"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

export type NavItem = { label: string; href: string };

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function Header({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("menu-open");
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth > 960 && setOpen(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    const toggle = toggleRef.current;
    return () => {
      document.body.classList.remove("menu-open");
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      toggle?.focus();
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
      <div className="container header-inner">
        <Link href="/" aria-label="BarathGo home">
          <Logo />
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {nav.map((item) => (
            <Link key={item.href} className={`nav-link${isActive(pathname, item.href) ? " is-active" : ""}`} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="btn btn-primary btn-sm header-cta" href="/book">
            Book a ride <Icon name="arrow" size={17} />
          </Link>
          <button ref={toggleRef} className="menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>
            <Icon name={open ? "close" : "menu"} />
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>
      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <nav className="container" aria-label="Mobile navigation">
          {nav.map((item) => (
            <Link key={item.href} className={`mobile-link${isActive(pathname, item.href) ? " is-active" : ""}`} href={item.href}>
              {item.label}
              <Icon name="arrow" size={18} />
            </Link>
          ))}
          <Link className="btn btn-primary btn-block" href="/book">
            Book a ride
          </Link>
          <Link className="btn btn-ghost btn-block" href="/contact">
            Help &amp; contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
