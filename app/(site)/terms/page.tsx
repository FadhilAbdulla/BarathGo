import { PageHero } from "@/components/Blocks";
import { pageMeta } from "@/lib/meta";
import { site } from "@/lib/site";

export const metadata = pageMeta("/terms");

// TODO: replace with terms reviewed by NFTCI's legal advisers before launch.
export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of use" intro="The basics that apply when you use this website and request a BarathGo ride." />
      <section className="section">
        <div className="container prose">
          <h2>Ride requests</h2>
          <p>A request made on this website is not a confirmed booking until our team confirms your driver, vehicle and fare by call or SMS.</p>
          <h2>Fares</h2>
          <p>Fares shown on this website are indicative. The final fare depends on the city, route, tolls, permits, parking and waiting time, and is confirmed before the trip.</p>
          <h2>Conduct</h2>
          <p>Riders and drivers must treat each other with respect. Harassment, violence, or damage to vehicles may lead to removal from the platform and reporting to the authorities.</p>
          <h2>Contact</h2>
          <p>
            Questions about these terms: <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
