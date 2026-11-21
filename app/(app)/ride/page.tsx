import { RiderApp } from "@/components/app/RiderApp";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("/ride");

export default function RidePage() {
  return <RiderApp />;
}
