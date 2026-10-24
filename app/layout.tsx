import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

/* Clean display face for headlines. */
const displayFont = Space_Grotesk({
  variable: "--font-pixel-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* UI label face. */
const labelFont = Inter({
  variable: "--font-pixel-label",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* Body/telemetry face. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://forecastguard.example"),
  title: "ForecastGuard",
  description:
    "Forecast bust detection for medium-range rainfall forecasts across IMD subdivisions.",
  applicationName: "ForecastGuard",
  openGraph: {
    title: "ForecastGuard",
    description: "Forecast bust detection for medium-range rainfall forecasts.",
    type: "website",
  },
  robots: { index: true, follow: true },
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
      className={`${displayFont.variable} ${labelFont.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
