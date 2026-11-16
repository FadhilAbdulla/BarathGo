import type { Metadata } from "next";
import { pages, site, type PagePath } from "./site";

/** Per-page metadata from lib/site.ts: title, description, canonical URL and Open Graph. */
export function pageMeta(path: PagePath): Metadata {
  const page = pages[path];
  return {
    title: path === "/" ? { absolute: page.title } : page.title,
    description: page.description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: site.name, locale: site.locale, title: page.title, description: page.description, url: path },
  };
}
