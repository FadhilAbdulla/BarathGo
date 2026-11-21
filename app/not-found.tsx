import Link from "next/link";
import { PageHero } from "@/components/Blocks";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <PageHero eyebrow="404" title="Wrong turn" intro="We couldn’t find that page. Let’s get you back on the road.">
      <Link className="btn btn-primary btn-lg" href="/">
        Go home
      </Link>
      <Link className="btn btn-ghost btn-lg" href="/ride">
        Book a ride
      </Link>
    </PageHero>
  );
}
