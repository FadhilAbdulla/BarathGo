import { CtaBand, FeatureGrid, PageHero, SectionHead } from "@/components/Blocks";
import { pageMeta } from "@/lib/meta";
import { site } from "@/lib/site";

export const metadata = pageMeta("/about");

const pillars = [
  { icon: "users" as const, title: "Cooperative ecosystem & trust", text: "A community-first, driver-empowered platform with fair earnings, transparency and local economic retention, instead of extractive commission models." },
  { icon: "globe" as const, title: "Pan-India reach", text: "NFTCI’s framework links BarathGo with government transport contracts, PSU travel requirements and tourism and pilgrimage circuits." },
  { icon: "shield" as const, title: "Compliance & governance", text: "Standard operating procedures, regulatory guidance and digital enablement from the Federation help BarathGo operate within state and national transport law." },
];

const tech = [
  { icon: "phone" as const, title: "Passenger app", text: "Intuitive booking, real-time GPS tracking, SOS and emergency features, and secure digital payments." },
  { icon: "car" as const, title: "Driver app", text: "Streamlined trip requests, turn-by-turn navigation, a daily earnings tracker and multilingual support." },
  { icon: "chart" as const, title: "Dispatch & admin portal", text: "Fleet management, demand heatmaps, fare management and customer grievance redressal in one place." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About BarathGo" title="Mobility owned by the people who move India" intro={`BarathGo is an online taxi platform launched under the ${site.parent.legalName} (NFTCI), the apex cooperative body for transport and mobility. It brings local transport operators, taxi unions, cooperatives and self-help groups onto one app.`} />
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Why NFTCI" title="The strength of a federation" intro="Being part of NFTCI gives BarathGo an established network of transport operators and institutional backing across India." />
          <FeatureGrid items={pillars} />
        </div>
      </section>
      <section className="section section--mist">
        <div className="container">
          <SectionHead eyebrow="Technology" title="One platform, three apps" intro="A reliable, scalable suite that connects riders, drivers and the dispatch team." />
          <FeatureGrid items={tech} />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Rollout" title="How BarathGo is growing" />
          <ol className="roadmap">
            <li className="reveal">
              <span className="tag">Phase 1</span>
              <h3>Foundation</h3>
              <p className="muted">Driver and cooperative onboarding, web booking with dispatch, and launch of core city and transfer services.</p>
            </li>
            <li className="reveal">
              <span className="tag">Phase 2</span>
              <h3>Apps &amp; verticals</h3>
              <p className="muted">Passenger and driver apps with live tracking and digital payments; intercity, pilgrimage, corporate and EV services.</p>
            </li>
            <li className="reveal">
              <span className="tag">Phase 3</span>
              <h3>National network</h3>
              <p className="muted">Expansion through NFTCI member cooperatives across states, with institutional and tourism-circuit partnerships.</p>
            </li>
          </ol>
        </div>
      </section>
      <CtaBand title="Partner with BarathGo" text="Cooperatives, operators, institutions and tourism bodies: let’s build fair mobility together." primary={{ label: "Get in touch", href: "/contact" }} secondary={{ label: "Drive with us", href: "/drive" }} />
    </>
  );
}
