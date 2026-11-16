import { PageHero } from "@/components/Blocks";
import { pageMeta } from "@/lib/meta";
import { site } from "@/lib/site";

export const metadata = pageMeta("/privacy");

// TODO: have this notice reviewed against the Digital Personal Data Protection Act, 2023 before launch.
export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy notice" intro="How BarathGo handles the information you share through this website." />
      <section className="section">
        <div className="container prose">
          <h2>What we collect</h2>
          <p>When you request a ride, sign up to drive, or contact us, we collect the details you type into the form: such as your name, mobile number, email, pickup and drop locations, trip time, and anything you write in the message.</p>
          <h2>How we use it</h2>
          <p>We use these details only to respond to you: to confirm and arrange your ride, process your driver or partner registration, or answer your enquiry. Ride details are shared with the driver assigned to your trip.</p>
          <h2>What we don’t do</h2>
          <p>We don’t sell your information, and this website doesn’t use advertising trackers.</p>
          <h2>How long we keep it</h2>
          <p>We keep request details only as long as needed to provide the service, resolve complaints and meet legal obligations.</p>
          <h2>Your choices</h2>
          <p>
            You can ask us to access, correct or delete your information by writing to <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
