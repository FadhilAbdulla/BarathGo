import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export function PageHero({ eyebrow, title, intro, children, tone = "light" }: { eyebrow: string; title: ReactNode; intro: ReactNode; children?: ReactNode; tone?: "light" | "dark" }) {
  return (
    <section className={`page-hero page-hero--${tone}`}>
      <div className="container page-hero__inner">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="lead">{intro}</p>
        {children && <div className="page-hero__actions">{children}</div>}
      </div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, intro, center = false }: { eyebrow: string; title: ReactNode; intro?: ReactNode; center?: boolean }) {
  return (
    <div className={`section-head reveal${center ? " section-head--center" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {intro && <p className="lead">{intro}</p>}
    </div>
  );
}

export type Feature = { icon: IconName; title: string; text: string };

export function FeatureGrid({ items, columns = 3 }: { items: Feature[]; columns?: 2 | 3 | 4 }) {
  return (
    <ul className={`feature-grid feature-grid--${columns}`}>
      {items.map((item) => (
        <li key={item.title} className="feature reveal">
          <span className="feature__icon">
            <Icon name={item.icon} />
          </span>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </li>
      ))}
    </ul>
  );
}

export function Faq({ items }: { items: { q: string; a: ReactNode }[] }) {
  return (
    <div className="faq">
      {items.map((item) => (
        <details key={item.q} className="faq__item reveal">
          <summary>
            {item.q}
            <span className="faq__plus" aria-hidden="true" />
          </summary>
          <div className="faq__body">{item.a}</div>
        </details>
      ))}
    </div>
  );
}

export function CtaBand({ title, text, primary, secondary }: { title: string; text: string; primary: { label: string; href: string }; secondary?: { label: string; href: string } }) {
  return (
    <section className="section">
      <div className="container">
        <div className="cta-band reveal">
          <div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
          <div className="cta-band__actions">
            <Link className="btn btn-primary btn-lg" href={primary.href}>
              {primary.label} <Icon name="arrow" size={18} />
            </Link>
            {secondary && (
              <Link className="btn btn-on-dark btn-lg" href={secondary.href}>
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
