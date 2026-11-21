import { CtaBand, FeatureGrid, PageHero, SectionHead } from "@/components/Blocks";
import { Icon } from "@/components/Icon";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("/safety");

const rider = [
  { icon: "id" as const, title: "Verified drivers", text: "Every driver’s licence, ID and police verification is checked before their first trip, and re-checked periodically." },
  { icon: "car" as const, title: "Inspected vehicles", text: "Vehicles carry a valid permit, insurance and fitness certificate, and pass a BarathGo inspection." },
  { icon: "share" as const, title: "Share your trip", text: "Send your live location, driver and vehicle details to family or friends with one tap." },
  { icon: "alert" as const, title: "SOS on every ride", text: "The SOS button alerts our safety desk and your emergency contacts, and connects you to emergency services (112)." },
  { icon: "pin" as const, title: "Live GPS tracking", text: "Every trip is tracked in real time, and route deviations are flagged to our safety team." },
  { icon: "headset" as const, title: "24×7 grievance redressal", text: "Report a concern any time. Every complaint gets a ticket, a named owner and a response." },
];

export default function SafetyPage() {
  return (
    <>
      <PageHero eyebrow="Safety" title="Safe rides, every time" intro="Safety isn’t a feature we add on. It runs through how BarathGo selects drivers, checks vehicles, tracks trips and handles every complaint." />
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="For riders" title="Protection before, during and after your trip" />
          <FeatureGrid items={rider} />
        </div>
      </section>
      <section className="section section--dark">
        <div className="container split">
          <div className="reveal">
            <span className="eyebrow">For drivers</span>
            <h2>Drivers deserve safety too</h2>
            <p className="lead">Drivers can rate riders, use their own SOS, and reach the same 24×7 safety desk. Abusive behaviour from anyone in the car leads to removal from the platform.</p>
          </div>
          <ul className="checklist reveal" style={{ color: "#fff" }}>
            {["Rider identity linked to a verified mobile number", "Driver SOS and trip recording", "Two-way ratings after every trip", "Clear zero-tolerance policy on harassment and violence"].map((item) => (
              <li key={item}>
                <Icon name="check" size={20} /> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section">
        <div className="container split">
          <div className="panel panel--brand reveal">
            <h3>In an emergency</h3>
            <p className="muted" style={{ marginBottom: 0 }}>
              If you are in immediate danger, call <strong>112</strong> (national emergency number) first. Then let us know so we can support you and act on the trip.
            </p>
          </div>
          <div className="panel reveal">
            <h3>Report a safety concern</h3>
            <p className="muted" style={{ marginBottom: 0 }}>Use the contact form and choose “Safety concern”. Share your trip date, pickup point and vehicle number if you have them.</p>
          </div>
        </div>
      </section>
      <CtaBand title="Report a concern" text="Every safety report is reviewed by a person, not a bot." primary={{ label: "Contact the safety desk", href: "/contact" }} />
    </>
  );
}
