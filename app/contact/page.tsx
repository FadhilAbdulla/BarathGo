import Link from "next/link";
import { PageHero } from "@/components/Blocks";
import { Icon } from "@/components/Icon";
import { RequestForm } from "@/components/RequestForm";
import { pageMeta } from "@/lib/meta";
import { site } from "@/lib/site";

export const metadata = pageMeta("/contact");

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact & support" title="How can we help?" intro="Questions about a ride, a safety concern, partnerships or media: send us a message and a member of the team will reply." />
      <section className="section">
        <div className="container split split--top">
          <div className="contact-cards">
            <div className="contact-card">
              <span className="feature__icon" style={{ margin: 0 }}>
                <Icon name="car" />
              </span>
              <div>
                <h3>Need a ride?</h3>
                <p>
                  The fastest way is the <Link href="/book">booking form</Link>. Our dispatch desk confirms by call or SMS.
                </p>
              </div>
            </div>
            <div className="contact-card">
              <span className="feature__icon" style={{ margin: 0 }}>
                <Icon name="alert" />
              </span>
              <div>
                <h3>Emergency</h3>
                <p>
                  If you’re in danger, call <strong>112</strong> first, then tell us. See <Link href="/safety">safety</Link>.
                </p>
              </div>
            </div>
            <div className="contact-card">
              <span className="feature__icon" style={{ margin: 0 }}>
                <Icon name="mail" />
              </span>
              <div>
                <h3>Email</h3>
                <p>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </p>
              </div>
            </div>
            <div className="contact-card">
              <span className="feature__icon" style={{ margin: 0 }}>
                <Icon name="building" />
              </span>
              <div>
                <h3>Office</h3>
                <p>
                  {site.address.lines.map((line) => (
                    <span key={line} style={{ display: "block" }}>
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
          <RequestForm
            id="contact"
            kind="contact"
            subject="Website enquiry"
            submitLabel="Send message"
            successMessage="Thank you. Your message has reached the BarathGo team. We’ll reply to the email address you gave."
            fields={[
              { name: "name", label: "Name", required: true, autoComplete: "name" },
              { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
              { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
              { name: "topic", label: "Topic", type: "select", required: true, options: ["Help with a ride", "Safety concern", "Lost item", "Fare or payment", "Group / pilgrimage trip", "Partnership", "Media", "Something else"] },
              { name: "message", label: "Message", type: "textarea", required: true, full: true },
            ]}
          />
        </div>
      </section>
    </>
  );
}
