import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { RevealObserver } from "@/components/RevealObserver";
import { pages, primaryNav } from "@/lib/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const nav = primaryNav.map((path) => ({ label: pages[path].label, href: path }));
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header nav={nav} />
      <main id="main">{children}</main>
      <Footer />
      <RevealObserver />
    </>
  );
}
