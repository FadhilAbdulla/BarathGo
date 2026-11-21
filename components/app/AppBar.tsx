"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type User, formatPhone } from "@/lib/api";
import { Icon } from "../Icon";
import { LogoMark } from "../Logo";

/** Black top bar for the rider, driver and admin apps, with an account menu. */
export function AppBar({ label, user, onLogout, children }: { label: string; user: User | null | undefined; onLogout: () => void; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => !menu.current?.contains(event.target as Node) && setOpen(false);
    const esc = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <header className="appbar">
      <Link href="/" className="appbar__brand" aria-label="BarathGo home">
        <LogoMark size={32} />
        <span>
          BarathGo <em>{label}</em>
        </span>
      </Link>
      <div className="appbar__right">
        {children}
        {user && (
          <div className="account" ref={menu}>
            <button className="account__btn" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((value) => !value)}>
              <span className="avatar">{(user.name ?? "?").trim().charAt(0).toUpperCase()}</span>
              <span className="account__name">{user.name?.split(" ")[0]}</span>
            </button>
            {open && (
              <div className="account__menu" role="menu">
                <div className="account__who">
                  <strong>{user.name}</strong>
                  <small>{formatPhone(user.phone)}</small>
                </div>
                <Link role="menuitem" href="/ride">
                  <Icon name="car" size={18} /> Ride
                </Link>
                <Link role="menuitem" href="/driver">
                  <Icon name="wallet" size={18} /> Drive &amp; earn
                </Link>
                {user.isAdmin && (
                  <Link role="menuitem" href="/admin">
                    <Icon name="grid" size={18} /> Admin
                  </Link>
                )}
                <Link role="menuitem" href="/contact">
                  <Icon name="headset" size={18} /> Help
                </Link>
                <button role="menuitem" onClick={onLogout}>
                  <Icon name="logout" size={18} /> Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
