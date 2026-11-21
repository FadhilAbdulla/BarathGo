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

export type PagePath = "/" | "/ride" | "/driver" | "/services" | "/drive" | "/business" | "/safety" | "/about" | "/contact" | "/privacy" | "/terms";

type PageSeo = { label: string; title: string; description: string; priority: number };

export const pages: Record<PagePath, PageSeo> = {
  "/": {
    label: "Home",
    title: "BarathGo — Fair Taxi Rides, Powered by India’s Cooperatives",
    description: site.description,
    priority: 1,
  },
  "/ride": {
    label: "Ride",
    title: "Book a Ride — Upfront Fares, Verified Drivers",
    description: "Book a BarathGo ride: see upfront fares for Auto, Mini, Sedan, SUV and EV, track your driver live and pay by UPI or cash.",
    priority: 0.9,
  },
  "/driver": {
    label: "Driver app",
    title: "Driver App — Go Online and Start Earning",
    description: "The BarathGo driver app: sign up, go online, accept nearby trips and track your earnings.",
    priority: 0.6,
  },
  "/services": {
    label: "Ride",
    title: "Ride Options — City, Intercity, Pilgrimage, Corporate & EV",
    description: "BarathGo services: everyday city rides, airport and railway transfers, outstation trips, hourly rentals, pilgrimage circuits, corporate travel and electric rides.",
    priority: 0.8,
  },
  "/drive": {
    label: "Drive",
    title: "Drive with BarathGo — Fair Earnings for Drivers & Cooperatives",
    description: "Join BarathGo as a driver, fleet owner, taxi union or cooperative. Transparent payouts, welfare benefits and the backing of NFTCI.",
    priority: 0.9,
  },
  "/business": {
    label: "Business",
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


export const absoluteUrl = (path: string) => (path === "/" ? `${site.url}/` : `${site.url}${path}`);
