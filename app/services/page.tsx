import Link from "next/link";
import { CtaBand, PageHero } from "@/components/Blocks";
import { Icon, type IconName } from "@/components/Icon";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("/services");

const services: { id: string; icon: IconName; title: string; text: string; tags: string[]; cta: { label: string; href: string } }[] = [
  { id: "city", icon: "car", title: "City rides", text: "Point-to-point rides around town, now or scheduled. Choose an Auto for short hops, a Mini or Sedan for everyday comfort, or an SUV when the whole family is coming.", tags: ["Auto", "Mini", "Sedan", "SUV", "Ride now or later"], cta: { label: "Book a city ride", href: "/book" } },
  { id: "airport", icon: "plane", title: "Airport & railway transfers", text: "Pickups timed to your flight or train, with room for luggage. Drivers wait at the agreed meeting point and track delays.", tags: ["Scheduled pickup", "Luggage space", "Meet & greet"], cta: { label: "Book a transfer", href: "/book" } },
  { id: "outstation", icon: "route", title: "Outstation & intercity", text: "One-way and round-trip journeys between cities with experienced local drivers. Tolls, permits and allowances are shown clearly in your quote.", tags: ["One way", "Round trip", "Multi-day"], cta: { label: "Get an outstation quote", href: "/book" } },
  { id: "rentals", icon: "hourglass", title: "Hourly rentals", text: "Keep a car and driver for a few hours or the whole day: errands, meetings, weddings or a day of sightseeing.", tags: ["4 hrs / 40 km", "8 hrs / 80 km", "12 hrs / 120 km"], cta: { label: "Book a rental", href: "/book" } },
  { id: "pilgrimage", icon: "temple", title: "Pilgrimage, tourism & events", text: "Building on NFTCI’s tourism and pilgrimage network, BarathGo arranges mobility for yatras, heritage circuits, melas and cultural events, for families and large groups alike.", tags: ["Pilgrimage circuits", "Group travel", "Event shuttles", "Tour operators"], cta: { label: "Plan a group trip", href: "/contact" } },
  { id: "corporate", icon: "briefcase", title: "Corporate & PSU travel", text: "Employee commute, guest pickups and official travel for companies, PSUs and government departments, with central billing and trip reports.", tags: ["Monthly invoicing", "Employee commute", "Guest travel"], cta: { label: "BarathGo for Business", href: "/business" } },
  { id: "ev", icon: "leaf", title: "Green & electric rides", text: "Electric cars from cooperative EV fleets, for zero-tailpipe city travel. We’re expanding EV coverage with member cooperatives and charging partners.", tags: ["Zero tailpipe", "Quiet rides", "Cooperative EV fleets"], cta: { label: "Book an EV", href: "/book" } },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="Ride options" title="Every kind of journey, one platform" intro="From daily commutes to once-in-a-lifetime pilgrimages, BarathGo connects you with trusted local drivers from India’s transport cooperatives.">
        <Link className="btn btn-primary btn-lg" href="/book">
          Book a ride <Icon name="arrow" size={18} />
        </Link>
      </PageHero>
      <section className="section">
        <div className="container service-list">
          {services.map((service) => (
            <article key={service.id} id={service.id} className="service reveal">
              <span className="feature__icon">
                <Icon name={service.icon} size={28} />
              </span>
              <div>
                <h2 style={{ fontSize: "1.45rem", marginBottom: 8 }}>{service.title}</h2>
                <p>{service.text}</p>
                <ul>
                  {service.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
              <Link className="btn btn-ghost" href={service.cta.href}>
                {service.cta.label}
              </Link>
            </article>
          ))}
        </div>
      </section>
      <CtaBand title="Need something different?" text="School runs, hospital visits, wedding fleets or long tours: tell us what you need and we’ll arrange it." primary={{ label: "Contact us", href: "/contact" }} secondary={{ label: "Book a ride", href: "/book" }} />
    </>
  );
}
