import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Lets riders and drivers install BarathGo to their home screen (opens straight into the rider app).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BarathGo",
    short_name: "BarathGo",
    description: "Fair rides, driven by India’s cooperatives.",
    start_url: "/ride",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcuts: [
      { name: "Book a ride", url: "/ride" },
      { name: "Driver app", url: "/driver" },
    ],
  };
}
