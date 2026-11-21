import Link from "next/link";
import { Faq, FeatureGrid, PageHero, SectionHead } from "@/components/Blocks";
import { Icon } from "@/components/Icon";
import { RequestForm } from "@/components/RequestForm";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("/drive");

const benefits = [
  { icon: "wallet" as const, title: "Transparent payouts", text: "See exactly what each trip pays and what the platform keeps. Earnings are settled to your bank account on a fixed schedule." },
  { icon: "heart" as const, title: "Welfare benefits", text: "Access to insurance, health and welfare schemes arranged through the cooperative network for drivers and their families." },
  { icon: "users" as const, title: "A voice in the platform", text: "Drivers and cooperatives are partners. Feedback from driver members shapes fares, policies and new services." },
  { icon: "chart" as const, title: "Daily earnings tracker", text: "The driver app shows trips, earnings and incentives day by day, with turn-by-turn navigation built in." },
  { icon: "language" as const, title: "Multilingual support", text: "App and support in regional languages, with onboarding help at your local cooperative or partner centre." },
  { icon: "shield" as const, title: "Safety for drivers too", text: "Verified riders, SOS for drivers, trip recording and a grievance desk that responds to drivers as quickly as riders." },
];

const partners = [
  { icon: "car" as const, title: "Independent drivers", text: "Own or lease a vehicle? Sign up directly and start receiving trip requests near you." },
  { icon: "building" as const, title: "Fleet owners", text: "Bring your cars and drivers onto BarathGo and manage them from one fleet dashboard." },
  { icon: "users" as const, title: "Taxi unions & cooperatives", text: "Onboard your members together, with cooperative-level reporting and payouts." },
  { icon: "heart" as const, title: "SHGs & community groups", text: "Self-help groups running autos, e-rickshaws or EVs can join as service partners." },
];

export default function DrivePage() {
  return (
    <>
      <PageHero tone="dark" eyebrow="Drive with BarathGo" title="Your car. Your work. Your fair share." intro="BarathGo is built for the people behind the wheel. Join India’s cooperative taxi platform with transparent payouts, welfare benefits and the backing of NFTCI.">
        <Link className="btn btn-white btn-lg" href="/driver">
          Sign up to drive <Icon name="arrow" size={18} />
        </Link>
        <a className="btn btn-on-dark btn-lg" href="#cooperatives">
          For cooperatives &amp; fleets
        </a>
      </PageHero>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Why drive with us" title="Built the cooperative way" intro="Instead of high commissions that drain driver income, BarathGo keeps earnings transparent and returns value to driver members and their communities." />
          <FeatureGrid items={benefits} />
        </div>
      </section>

      <section className="section section--mist" id="cooperatives">
        <div className="container">
          <SectionHead eyebrow="Who can join" title="One platform for every kind of operator" />
          <FeatureGrid items={partners} columns={4} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Getting started" title="Onboarding in four steps" center />
          <ol className="steps" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <li className="reveal">
              <h3>Sign up in the app</h3>
              <p>Log in with your mobile number in the driver app and add your vehicle and licence details.</p>
            </li>
            <li className="reveal">
              <h3>Share documents</h3>
              <p>Driving licence, vehicle RC, permit, insurance, PUC and ID proof for verification.</p>
            </li>
            <li className="reveal">
              <h3>Vehicle check &amp; training</h3>
              <p>A quick vehicle inspection and a short session on the app, safety and service standards.</p>
            </li>
            <li className="reveal">
              <h3>Start earning</h3>
              <p>Go online in the driver app and start accepting trips near you.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section section--cream" id="signup">
        <div className="container" style={{ marginBottom: 48 }}>
          <div className="cta-band reveal">
            <div>
              <h2>Ready to drive?</h2>
              <p>Sign up in the driver app in a few minutes. Keep your licence, RC, permit and insurance handy.</p>
            </div>
            <div className="cta-band__actions">
              <Link className="btn btn-white btn-lg" href="/driver">
                Open the driver app
              </Link>
            </div>
          </div>
        </div>
        <div className="container split split--top">
          <div className="reveal">
            <span className="eyebrow">Cooperatives, unions &amp; fleets</span>
            <h2>Onboard your members together</h2>
            <p className="lead">Taxi unions, transport cooperatives, fleet owners and SHGs can bring their drivers onto BarathGo as a group. Tell us about your organisation and our partnerships team will get in touch.</p>
            <h3 style={{ marginTop: 28 }}>Each driver will need</h3>
            <ul className="checklist">
              {["Valid driving licence (commercial / badge where required)", "Vehicle registration certificate (RC) and permit", "Insurance and pollution (PUC) certificate", "Aadhaar or other government ID, and bank account details"].map((item) => (
                <li key={item}>
                  <Icon name="check" size={20} /> {item}
                </li>
              ))}
            </ul>
          </div>
          <RequestForm
            id="driver"
            kind="driver"
            subject="Fleet / cooperative enquiry"
            submitLabel="Send enquiry"
            successMessage="Thank you. Our partnerships team will call you within two working days."
            fields={[
              { name: "name", label: "Your name", required: true, autoComplete: "name" },
              { name: "organisation", label: "Organisation" },
              { name: "phone", label: "Mobile number", type: "tel", required: true, autoComplete: "tel", placeholder: "+91" },
              { name: "city", label: "City / district", required: true, autoComplete: "address-level2" },
              { name: "state", label: "State / UT", autoComplete: "address-level1" },
              { name: "role", label: "Joining as", type: "select", required: true, options: ["Fleet owner", "Taxi union / association", "Transport cooperative", "SHG / community group"] },
              { name: "vehicle", label: "Main vehicle type", type: "select", options: ["Auto-rickshaw", "E-rickshaw", "Hatchback", "Sedan", "SUV / MUV", "Electric car", "Tempo traveller / bus", "No vehicle yet"] },
              { name: "fleet", label: "Number of vehicles", type: "number" },
              { name: "email", label: "Email", type: "email", autoComplete: "email" },
              { name: "message", label: "Anything else we should know?", type: "textarea", full: true },
            ]}
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="FAQ" title="Driver questions" center />
          <Faq
            items={[
              { q: "Do I need my own vehicle?", a: <p>No. If you have a valid licence but no vehicle, register as a driver without a vehicle and we’ll connect you with fleet owners and cooperatives in your area.</p> },
              { q: "How and when am I paid?", a: <p>Cash and UPI fares go straight to you. Digital and corporate trip earnings are settled to your bank account on a fixed weekly schedule, with a clear statement of every deduction.</p> },
              { q: "Is there a joining fee?", a: <p>Onboarding terms, including any cooperative membership, are explained by our team before you sign anything. You will never be asked to pay a stranger online to register.</p> },
              { q: "Can my cooperative join as a group?", a: <p>Yes. Taxi unions, transport cooperatives and SHGs can onboard members together and receive cooperative-level reports and payouts. Choose your organisation type in the form.</p> },
            ]}
          />
        </div>
      </section>
    </>
  );
}
