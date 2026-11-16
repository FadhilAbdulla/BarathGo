import Link from "next/link";
import { CtaBand, Faq, FeatureGrid, SectionHead } from "@/components/Blocks";
import { BookingWidget } from "@/components/BookingWidget";
import { FareEstimator } from "@/components/FareEstimator";
import { HeroVisual } from "@/components/HeroVisual";
import { Icon, type IconName } from "@/components/Icon";
import { pageMeta } from "@/lib/meta";
import { rideTypes, site } from "@/lib/site";

export const metadata = pageMeta("/");

const verticals: { icon: IconName; title: string; text: string; href: string }[] = [
  { icon: "car", title: "City rides", text: "Everyday trips across town in an Auto, Mini, Sedan, SUV or EV.", href: "/services#city" },
  { icon: "plane", title: "Airport & railway", text: "Scheduled pickups timed to your flight or train, with luggage space.", href: "/services#airport" },
  { icon: "route", title: "Outstation", text: "One-way and round-trip intercity journeys with local drivers who know the route.", href: "/services#outstation" },
  { icon: "temple", title: "Pilgrimage & tours", text: "Comfortable mobility for pilgrimage circuits, heritage trails and cultural events.", href: "/services#pilgrimage" },
  { icon: "briefcase", title: "Corporate & PSU", text: "Managed employee and guest travel with monthly billing and reports.", href: "/business" },
  { icon: "leaf", title: "Green rides", text: "Electric vehicles from cooperative EV fleets for cleaner city travel.", href: "/services#ev" },
];

const why = [
  { icon: "users" as const, title: "Owned by the community", text: "Drivers, taxi unions and cooperatives are partners, not just suppliers. More of every fare stays with the person driving." },
  { icon: "rupee" as const, title: "Fair, transparent fares", text: "Clear per-km pricing with your fare confirmed before the trip. No hidden charges added at the end." },
  { icon: "shield" as const, title: "Safety built in", text: "Verified drivers and vehicles, live trip sharing, an SOS button on every ride and 24×7 support." },
  { icon: "language" as const, title: "Made for Bharat", text: "Multilingual support, cash and UPI payments, and service in cities, towns and tourism circuits alike." },
];

const faqs = [
  { q: "How do I book a BarathGo ride?", a: <p>Enter your pickup, drop and time in the booking form, pick a ride type and leave your mobile number. Our dispatch desk confirms your driver and fare by call or SMS. The BarathGo passenger app is on its way and will let you book and track rides instantly.</p> },
  { q: "Where is BarathGo available?", a: <p>BarathGo is rolling out city by city through NFTCI’s member cooperatives. If we can’t serve your trip yet, we’ll tell you when we call to confirm, and you can still request outstation and pilgrimage trips from most regions.</p> },
  { q: "How do I pay?", a: <p>Pay your driver by UPI or cash at the end of the trip. Corporate customers can opt for monthly invoicing through <Link href="/business">BarathGo for Business</Link>.</p> },
  { q: "Are the fares on this site final?", a: <p>The estimates are indicative city fares. Your exact fare depends on the city, route, tolls and waiting time, and is always confirmed with you before the trip starts.</p> },
  { q: "How is BarathGo different from other taxi apps?", a: <p>BarathGo is launched under {site.parent.legalName}, India’s apex cooperative body for transport and tourism. It is built around fair earnings for drivers and local ownership, so value stays in the communities it serves.</p> },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <span className="hero__badge">
              <b>New</b> India’s cooperative taxi platform, launched under NFTCI
            </span>
            <h1>
              Your ride, <span>fairly</span> driven.
            </h1>
            <p className="lead">Book city rides, airport transfers, outstation and pilgrimage trips with verified local drivers who earn what they deserve.</p>
            <BookingWidget />
            <ul className="hero__trust">
              <li>
                <Icon name="shield" size={18} /> Verified drivers
              </li>
              <li>
                <Icon name="rupee" size={18} /> Fare confirmed upfront
              </li>
              <li>
                <Icon name="headset" size={18} /> 24×7 support
              </li>
            </ul>
          </div>
          <HeroVisual />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Ride options" title="A ride for every journey" intro="From a quick auto to the market to a family SUV for the airport, choose what suits your trip and budget." />
          <ul className="ride-cards">
            {rideTypes.map((ride) => (
              <li key={ride.id} className="ride-card reveal">
                <span className={`ride-option__icon${ride.green ? " is-green" : ""}`}>
                  <Icon name={ride.id === "auto" ? "auto" : ride.green ? "leaf" : "car"} />
                </span>
                <h3>{ride.name}</h3>
                <p>{ride.blurb}</p>
                <span className="ride-card__meta">
                  {ride.seats} seats · ₹{ride.perKm}/km
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--mist">
        <div className="container">
          <SectionHead eyebrow="Services" title="Beyond the city ride" intro="BarathGo draws on NFTCI’s strengths in transport, tourism and pilgrimage mobility to cover the journeys India actually takes." />
          <ul className="feature-grid feature-grid--3">
            {verticals.map((item) => (
              <li key={item.title} className="reveal">
                <Link href={item.href} className="feature" style={{ display: "block", height: "100%" }}>
                  <span className="feature__icon">
                    <Icon name={item.icon} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="How it works" title="Booked in under a minute" center />
          <ol className="steps">
            <li className="reveal">
              <h3>Tell us where</h3>
              <p>Enter pickup, drop and when you want to leave. Add the distance to see an estimate.</p>
            </li>
            <li className="reveal">
              <h3>Choose your ride</h3>
              <p>Pick Auto, Mini, Sedan, SUV or EV and compare indicative fares side by side.</p>
            </li>
            <li className="reveal">
              <h3>Get confirmed</h3>
              <p>We confirm your driver, vehicle and fare by call or SMS. Track and share your trip on the way.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <SectionHead eyebrow="Why BarathGo" title="A taxi platform that works for everyone in the car" intro="Most ride apps take a large cut from drivers. BarathGo is built the cooperative way: fair to riders, fair to drivers, and accountable to the communities it serves." />
          <FeatureGrid items={why} columns={4} />
        </div>
      </section>

      <section className="section section--cream" id="fares">
        <div className="container split">
          <div className="reveal">
            <span className="eyebrow">Fare estimate</span>
            <h2>Know what you’ll pay before you go</h2>
            <p className="lead">Slide to your trip distance and compare indicative fares across every ride type.</p>
            <ul className="checklist">
              <li>
                <Icon name="check" size={20} /> Simple base fare plus per-km and ride-time pricing
              </li>
              <li>
                <Icon name="check" size={20} /> Fare confirmed with you before the trip begins
              </li>
              <li>
                <Icon name="check" size={20} /> Pay by UPI or cash, straight to your driver
              </li>
            </ul>
            <Link className="btn btn-primary btn-lg" href="/book">
              Book a ride <Icon name="arrow" size={18} />
            </Link>
          </div>
          <div className="reveal">
            <FareEstimator />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split" style={{ alignItems: "stretch" }}>
          <div className="panel panel--green reveal">
            <span className="eyebrow" style={{ color: "var(--green)" }}>
              For drivers &amp; cooperatives
            </span>
            <h2>Drive with BarathGo. Keep more of what you earn.</h2>
            <p className="muted">Independent drivers, fleet owners, taxi unions, transport cooperatives and SHGs can join with transparent payouts, welfare benefits and the backing of NFTCI.</p>
            <Link className="btn btn-dark btn-lg" href="/drive">
              Join as a driver partner <Icon name="arrow" size={18} />
            </Link>
          </div>
          <div className="panel panel--brand reveal">
            <span className="eyebrow">For organisations</span>
            <h2>Travel for teams, guests and events</h2>
            <p className="muted">Companies, PSUs, government departments and tour operators get managed rides, a single monthly invoice and dedicated support.</p>
            <Link className="btn btn-primary btn-lg" href="/business">
              BarathGo for Business <Icon name="arrow" size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--mist">
        <div className="container">
          <SectionHead eyebrow="FAQ" title="Questions riders ask" center />
          <Faq items={faqs} />
        </div>
      </section>

      <CtaBand title="Ready when you are" text="Request your first BarathGo ride now. Our dispatch desk will confirm your driver and fare." primary={{ label: "Book a ride", href: "/book" }} secondary={{ label: "Talk to us", href: "/contact" }} />
    </>
  );
}
