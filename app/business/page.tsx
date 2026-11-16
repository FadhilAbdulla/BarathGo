import { FeatureGrid, PageHero, SectionHead } from "@/components/Blocks";
import { Icon } from "@/components/Icon";
import { RequestForm } from "@/components/RequestForm";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("/business");

const offer = [
  { icon: "wallet" as const, title: "One monthly invoice", text: "Centralised billing with GST invoices and cost-centre tagging, instead of reimbursing individual receipts." },
  { icon: "chart" as const, title: "Trip reports", text: "Every ride logged with route, time, fare and traveller for audit-ready reporting." },
  { icon: "shield" as const, title: "Duty of care", text: "Verified drivers, live trip tracking and SOS for every employee and guest you send." },
  { icon: "headset" as const, title: "Dedicated support", text: "A named account manager and priority dispatch for time-critical travel." },
  { icon: "users" as const, title: "Event & group mobility", text: "Fleets for conferences, official visits, delegations and pilgrimage or tourism groups." },
  { icon: "leaf" as const, title: "Greener travel", text: "Opt for EVs to support your organisation’s sustainability commitments." },
];

export default function BusinessPage() {
  return (
    <>
      <PageHero eyebrow="BarathGo for Business" title="Managed travel for companies, PSUs and institutions" intro="Through NFTCI’s institutional linkages, BarathGo serves corporate offices, Public Sector Undertakings, government departments and tourism operators with reliable, accountable ground transport.">
        <a className="btn btn-primary btn-lg" href="#enquire">
          Talk to our team <Icon name="arrow" size={18} />
        </a>
      </PageHero>
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="What you get" title="Ground transport you can account for" />
          <FeatureGrid items={offer} />
        </div>
      </section>
      <section className="section section--mist" id="enquire">
        <div className="container split split--top">
          <div className="reveal">
            <span className="eyebrow">Enquire</span>
            <h2>Set up a business account</h2>
            <p className="lead">Tell us about your travel needs and we’ll send a proposal with service levels and pricing.</p>
            <ul className="checklist">
              {["Employee commute and shift transport", "Airport and guest pickups", "Official and intercity travel", "Events, delegations and tour groups"].map((item) => (
                <li key={item}>
                  <Icon name="check" size={20} /> {item}
                </li>
              ))}
            </ul>
          </div>
          <RequestForm
            id="business"
            kind="business"
            subject="Business enquiry"
            submitLabel="Send enquiry"
            successMessage="Thank you. Our business team will reply to the email address you gave within two working days."
            fields={[
              { name: "name", label: "Your name", required: true, autoComplete: "name" },
              { name: "organisation", label: "Organisation", required: true, autoComplete: "organization" },
              { name: "email", label: "Work email", type: "email", required: true, autoComplete: "email" },
              { name: "phone", label: "Phone", type: "tel", required: true, autoComplete: "tel" },
              { name: "need", label: "Main travel need", type: "select", required: true, options: ["Employee commute", "Airport & guest transfers", "Official / intercity travel", "Events & delegations", "Tourism / pilgrimage groups", "Several of these"] },
              { name: "volume", label: "Approx. trips per month", type: "select", options: ["Under 50", "50–200", "200–1,000", "Over 1,000"] },
              { name: "city", label: "City / cities", full: true },
              { name: "message", label: "Tell us more", type: "textarea", full: true },
            ]}
          />
        </div>
      </section>
    </>
  );
}
