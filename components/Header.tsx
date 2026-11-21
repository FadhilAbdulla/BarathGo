"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

export type NavItem = { label: string; href: string };

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function Header({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="topnav">
      <div className="container topnav__inner">
        <div className="topnav__left">
          <Link href="/" aria-label="BarathGo home">
            <Logo invert />
          </Link>
          <nav className="topnav__links" aria-label="Primary">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={isActive(pathname, item.href) ? "is-active" : ""} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="topnav__right">
          <Link className="topnav__plain" href="/contact">
            Help
          </Link>
          <Link className="topnav__plain" href="/ride">
            Log in
          </Link>
          <Link className="btn btn-white btn-sm btn-pill" href="/ride">
            Sign up
          </Link>
          <button className="topnav__menu" type="button" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((value) => !value)}>
            <Icon name={open ? "close" : "menu"} />
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile">
          <div className="container">
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href="/contact">Help</Link>
            <div className="mobile-nav__cta">
              <Link className="btn btn-white btn-lg btn-block" href="/ride">
                Book a ride
              </Link>
              <Link className="btn btn-outline-white btn-lg btn-block" href="/driver">
                Sign up to drive
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
