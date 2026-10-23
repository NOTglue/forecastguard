import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Pixelify_Sans, Silkscreen } from "next/font/google";
import "./globals.css";

/* Pixel display face for headlines, labels and figures. */
const pixelDisplay = Pixelify_Sans({
  variable: "--font-pixel-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* Chunkier pixel face, reserved for tiny UI labels and nav chips. */
const pixelLabel = Silkscreen({
  variable: "--font-pixel-label",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

/* Telemetry face: all body copy and numeric tables. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    images: ["/img/hero-pixel.svg"],
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f3ead7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${pixelDisplay.variable} ${pixelLabel.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
