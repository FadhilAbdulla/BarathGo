import Link from "next/link";
import { HeroSearch } from "@/components/HeroSearch";
import { Icon, type IconName } from "@/components/Icon";
import { BusinessMock, DriverMock, HeroMap, SafetyMock } from "@/components/Mockups";
import { VehicleArt } from "@/components/Vehicles";
import { PLATFORM_FEE, type RideTypeId } from "@/lib/fares";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("/");

type Suggestion = { title: string; text: string; href: string; art: { vehicle: RideTypeId } | { icon: IconName } };

const suggestions: Suggestion[] = [
  { title: "Ride", text: "Go anywhere in the city. Request a ride, hop in and go.", href: "/ride", art: { vehicle: "sedan" } },
  { title: "Auto", text: "Affordable auto-rickshaw rides for quick everyday trips.", href: "/ride", art: { vehicle: "auto" } },
  { title: "EV", text: "Zero-emission electric rides from cooperative EV fleets.", href: "/ride", art: { vehicle: "ev" } },
  { title: "Intercity", text: "One-way and round trips between cities with local drivers.", href: "/services#outstation", art: { icon: "route" } },
  { title: "Pilgrimage", text: "Comfortable travel for yatras, tours and festivals.", href: "/services#pilgrimage", art: { icon: "temple" } },
  { title: "Business", text: "Managed rides for teams and guests, on one invoice.", href: "/business", art: { icon: "briefcase" } },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="hero__loc">
              <Icon name="pin" size={16} /> Now booking across India
            </p>
            <h1>Ride anywhere. Pay what’s fair.</h1>
            <p className="hero__sub">Upfront prices, verified drivers, and a platform owned by India’s transport cooperatives.</p>
            <HeroSearch />
          </div>
          <HeroMap />
        </div>
      </section>

      <section className="block">
        <div className="container">
          <h2 className="block__title">Explore what you can do with BarathGo</h2>
          <ul className="suggest">
            {suggestions.map((item) => (
              <li key={item.title}>
                <Link href={item.href} className="suggest__card">
                  <span className="suggest__text">
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                    <span className="suggest__btn">Details</span>
                  </span>
                  <span className="suggest__art" aria-hidden="true">
                    {"vehicle" in item.art ? <VehicleArt type={item.art.vehicle} /> : <Icon name={item.art.icon} size={56} />}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="block">
        <div className="container row">
          <div className="row__media reveal">
            <DriverMock />
          </div>
          <div className="row__copy reveal">
            <h2>Drive when you want. Keep more of what you make.</h2>
            <p>
              Go online whenever it suits you and see what you’ll earn before you accept. You keep {Math.round((1 - PLATFORM_FEE) * 100)}% of every fare, with welfare support from the cooperative network.
            </p>
            <div className="row__cta">
              <Link className="btn btn-black btn-lg" href="/driver">
                Get started
              </Link>
              <Link className="text-link" href="/drive">
                Learn about driving
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container row row--reverse">
          <div className="row__media reveal">
            <BusinessMock />
          </div>
          <div className="row__copy reveal">
            <h2>Ground transport your organisation can account for</h2>
            <p>Employee commutes, guest pickups and official travel for companies, PSUs and government bodies, with central billing, trip reports and dedicated support.</p>
            <div className="row__cta">
              <Link className="btn btn-black btn-lg" href="/business">
                Get started
              </Link>
              <Link className="text-link" href="/services#corporate">
                See our solutions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container row">
          <div className="row__media reveal">
            <SafetyMock />
          </div>
          <div className="row__copy reveal">
            <h2>Safety is built into every trip</h2>
            <ul className="ticks">
              <li>
                <Icon name="id" size={22} />
                <span>
                  <strong>Verified drivers and vehicles.</strong> Licence, RC and permit checked before the first trip.
                </span>
              </li>
              <li>
                <Icon name="shield" size={22} />
                <span>
                  <strong>A PIN to start every ride.</strong> Your trip only begins with the right driver.
                </span>
              </li>
              <li>
                <Icon name="share" size={22} />
                <span>
                  <strong>Live tracking and SOS.</strong> Share your trip and reach 112 in one tap.
                </span>
              </li>
            </ul>
            <div className="row__cta">
              <Link className="btn btn-black btn-lg" href="/safety">
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="coop">
        <div className="container">
          <div className="coop__head reveal">
            <h2>Owned by the people who move India</h2>
            <p>BarathGo is launched under NFTCI, the national federation of tourism and transport cooperatives. Instead of extracting value from drivers, it returns it to them and their communities.</p>
          </div>
          <ul className="coop__grid">
            {[
              ["users", "Cooperative ownership", "Taxi unions, cooperatives and self-help groups join as partners, not just suppliers."],
              ["rupee", "Fair, upfront fares", "Clear per-km pricing shown before you ride, and a small platform fee."],
              ["globe", "Built for Bharat", "Cities, towns, tourism circuits and pilgrimage routes, with UPI and cash."],
            ].map(([icon, title, text]) => (
              <li key={title} className="reveal">
                <Icon name={icon as IconName} size={28} />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
          <Link className="btn btn-white btn-lg" href="/about">
            About BarathGo
          </Link>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <h2 className="block__title">It’s easier in the app</h2>
          <div className="apps">
            <Link href="/ride" className="apps__card">
              <span className="apps__icon">
                <Icon name="car" size={30} />
              </span>
              <span>
                <strong>Open the BarathGo app</strong>
                <small>Book rides in your browser. Add it to your home screen to use it like an app.</small>
              </span>
              <Icon name="arrow" size={26} />
            </Link>
            <Link href="/driver" className="apps__card">
              <span className="apps__icon">
                <Icon name="wallet" size={30} />
              </span>
              <span>
                <strong>Open the Driver app</strong>
                <small>Sign up, go online and start earning with your vehicle.</small>
              </span>
              <Icon name="arrow" size={26} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
