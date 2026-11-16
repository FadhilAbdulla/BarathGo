// Single source of truth for BarathGo details, navigation, ride types and per-page SEO.
// TODO before launch: confirm the support email and the indicative fares below with the operations team.

export const site = {
  url: "https://barathgo.com",
  name: "BarathGo",
  tagline: "Fair rides. Driven by India’s cooperatives.",
  description:
    "BarathGo is a community-first taxi platform launched under NFTCI. Book city rides, airport transfers, intercity and pilgrimage trips with fair fares and drivers who earn more.",
  email: "hello@barathgo.com",
  locale: "en_IN",
  // 1200×630 social preview, rendered from scripts/og-image.html
  ogImage: { url: "/og-image.png", width: 1200, height: 630, alt: "BarathGo — fair rides, driven by India’s cooperatives. An NFTCI initiative." },
  parent: {
    name: "NFTCI",
    legalName: "National Federation of Tourism & Transport Co-operatives of India Ltd",
    url: "https://nftcindia.in",
  },
  address: {
    lines: ["C/o NFTCI, NCUI Printing Press & Skill Development Centre", "2nd Floor, B-81, Sector 80", "Noida, Uttar Pradesh"],
    short: "Sector 80, Noida, Uttar Pradesh",
  },
} as const;

export type PagePath = "/" | "/book" | "/services" | "/drive" | "/business" | "/safety" | "/about" | "/contact" | "/privacy" | "/terms";

type PageSeo = { label: string; title: string; description: string; priority: number };

export const pages: Record<PagePath, PageSeo> = {
  "/": {
    label: "Home",
    title: "BarathGo — Fair Taxi Rides, Powered by India’s Cooperatives",
    description: site.description,
    priority: 1,
  },
  "/book": {
    label: "Book a ride",
    title: "Book a Ride — City, Airport, Outstation & Rentals",
    description: "Request a BarathGo ride: choose Auto, Mini, Sedan, SUV or EV, see an indicative fare and get your booking confirmed by call or SMS.",
    priority: 0.9,
  },
  "/services": {
    label: "Ride options",
    title: "Ride Options — City, Intercity, Pilgrimage, Corporate & EV",
    description: "BarathGo services: everyday city rides, airport and railway transfers, outstation trips, hourly rentals, pilgrimage circuits, corporate travel and electric rides.",
    priority: 0.8,
  },
  "/drive": {
    label: "Drive with us",
    title: "Drive with BarathGo — Fair Earnings for Drivers & Cooperatives",
    description: "Join BarathGo as a driver, fleet owner, taxi union or cooperative. Transparent payouts, welfare benefits and the backing of NFTCI.",
    priority: 0.9,
  },
  "/business": {
    label: "For business",
    title: "BarathGo for Business — Corporate, PSU & Institutional Travel",
    description: "Managed employee, guest and event travel for companies, PSUs, government bodies and tourism operators, with monthly billing and one dashboard.",
    priority: 0.7,
  },
  "/safety": {
    label: "Safety",
    title: "Safety on Every Ride — SOS, Live Tracking & Verified Drivers",
    description: "How BarathGo keeps riders and drivers safe: verified drivers and vehicles, live trip sharing, in-app SOS and 24×7 grievance redressal.",
    priority: 0.7,
  },
  "/about": {
    label: "About",
    title: "About BarathGo — A Cooperative Mobility Platform under NFTCI",
    description: "Why BarathGo exists, how the cooperative model works, and how NFTCI’s federation of transport cooperatives backs the platform across India.",
    priority: 0.7,
  },
  "/contact": {
    label: "Contact",
    title: "Contact BarathGo — Support & Enquiries",
    description: "Get help with a ride, report a concern, or reach the BarathGo team for partnerships and media.",
    priority: 0.6,
  },
  "/privacy": {
    label: "Privacy",
    title: "Privacy Notice",
    description: "How BarathGo handles the personal information you share when you request a ride or contact us.",
    priority: 0.2,
  },
  "/terms": {
    label: "Terms",
    title: "Terms of Use",
    description: "Terms that apply when you use the BarathGo website and request rides.",
    priority: 0.2,
  },
};

export const primaryNav: PagePath[] = ["/services", "/drive", "/business", "/safety", "/about"];

export type RideType = {
  id: string;
  name: string;
  blurb: string;
  seats: number;
  base: number; // ₹ flag-down fare, includes the first 2 km
  perKm: number; // ₹ per km after the first 2 km
  perMin: number; // ₹ per minute of ride time
  minimum: number; // ₹ minimum fare
  green?: boolean;
};

// Indicative city fares. Final fares depend on the city, time of day, tolls and waiting time,
// and are always shown in the app before the rider confirms.
export const rideTypes: RideType[] = [
  { id: "auto", name: "Auto", blurb: "Quick hops around town", seats: 3, base: 30, perKm: 13, perMin: 0.5, minimum: 30 },
  { id: "mini", name: "Mini", blurb: "Compact AC hatchbacks", seats: 4, base: 50, perKm: 14, perMin: 1, minimum: 80 },
  { id: "sedan", name: "Sedan", blurb: "Roomy AC sedans", seats: 4, base: 70, perKm: 17, perMin: 1.25, minimum: 110 },
  { id: "suv", name: "SUV", blurb: "Six seats for family & luggage", seats: 6, base: 100, perKm: 22, perMin: 1.5, minimum: 160 },
  { id: "ev", name: "EV", blurb: "Zero-tailpipe electric cars", seats: 4, base: 60, perKm: 15, perMin: 1, minimum: 90, green: true },
];

/** Indicative fare range for a trip, assuming average city speed of ~22 km/h. */
export function estimateFare(ride: RideType, km: number) {
  const minutes = (km / 22) * 60;
  const raw = ride.base + Math.max(0, km - 2) * ride.perKm + minutes * ride.perMin;
  const fare = Math.max(ride.minimum, raw);
  const round = (value: number) => Math.round(value / 5) * 5;
  return { low: round(fare * 0.95), high: round(fare * 1.1), minutes: Math.round(minutes) };
}

export const tripKinds = ["City ride", "Airport / railway transfer", "Outstation (one way)", "Outstation (round trip)", "Hourly rental", "Pilgrimage / tour package"] as const;

export const absoluteUrl = (path: string) => (path === "/" ? `${site.url}/` : `${site.url}${path}`);
