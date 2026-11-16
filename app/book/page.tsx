import Link from "next/link";
import { Faq, SectionHead } from "@/components/Blocks";
import { BookingWidget } from "@/components/BookingWidget";
import { FareEstimator } from "@/components/FareEstimator";
import { Icon } from "@/components/Icon";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("/book");

export default function BookPage() {
  return (
    <>
      <section className="hero">
        <div className="container split split--top">
          <div>
            <span className="eyebrow">Book a ride</span>
            <h1>Request your BarathGo ride</h1>
            <p className="lead">Tell us your trip and pick a ride type. Our dispatch desk confirms your driver, vehicle and fare by call or SMS, usually within a few minutes.</p>
            <ul className="checklist">
              <li>
                <Icon name="check" size={20} /> City rides, airport &amp; railway transfers, outstation and hourly rentals
              </li>
              <li>
                <Icon name="check" size={20} /> Book now or schedule ahead
              </li>
              <li>
                <Icon name="check" size={20} /> Pay by UPI or cash at the end of the trip
              </li>
            </ul>
            <p className="muted">
              Planning a group pilgrimage or tour? <Link className="text-link" href="/services#pilgrimage">See tour packages</Link>
            </p>
          </div>
          <BookingWidget heading="Plan your trip" />
        </div>
      </section>

      <section className="section" id="fares">
        <div className="container split">
          <div className="reveal">
            <span className="eyebrow">Fares</span>
            <h2>Indicative fares</h2>
            <p className="lead">Every fare is a base fare (including the first 2 km), a per-km rate after that, and a small charge for ride time. Outstation and rental trips are quoted when we confirm.</p>
          </div>
          <div className="reveal">
            <FareEstimator />
          </div>
        </div>
      </section>

      <section className="section section--mist">
        <div className="container">
          <SectionHead eyebrow="Booking help" title="Good to know" center />
          <Faq
            items={[
              { q: "How soon will my booking be confirmed?", a: <p>The dispatch desk calls or messages you shortly after you request, with your driver’s name, vehicle number and confirmed fare. For scheduled trips, you’ll also get a reminder before pickup.</p> },
              { q: "Can I cancel?", a: <p>Yes. Reply to the confirmation message or call back the number that contacted you. There is no charge for cancelling before a driver is on the way.</p> },
              { q: "Do outstation fares include tolls and driver allowance?", a: <p>Outstation quotes list tolls, state permits and any night allowance separately, so you can see exactly what you’re paying for before you confirm.</p> },
              { q: "Is there a BarathGo app?", a: <p>The passenger and driver apps are being rolled out with live tracking, in-app SOS and digital payments. Until then, web requests are handled by our dispatch team.</p> },
            ]}
          />
        </div>
      </section>
    </>
  );
}
