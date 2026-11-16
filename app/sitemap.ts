import type { MetadataRoute } from "next";
import { absoluteUrl, pages, type PagePath } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return (Object.keys(pages) as PagePath[]).map((path) => ({ url: absoluteUrl(path), priority: pages[path].priority }));
}
