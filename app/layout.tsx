import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Public_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://forecastguard.example"),
  title: "ForecastGuard · Forecast bust detection",
  description:
    "A decision-support prototype that estimates where and when a medium-range weather forecast is likely to be wrong, across 15 IMD subdivisions and a Day 1–10 horizon.",
  applicationName: "ForecastGuard",
  keywords: ["SIH26079", "forecast bust", "NWP", "IMD", "GFS", "monsoon"],
  openGraph: {
    title: "ForecastGuard · Forecast bust detection",
    description:
      "Region and lead-time bust probability for medium-range NWP forecasts. Prototype build with simulated data.",
    type: "website",
    images: ["/img/hero-atlas.svg"],
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f7f6f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${publicSans.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
