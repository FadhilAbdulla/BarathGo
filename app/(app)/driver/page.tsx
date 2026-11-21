import { DriverApp } from "@/components/app/DriverApp";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("/driver");

export default function DriverPage() {
  return <DriverApp />;
}
