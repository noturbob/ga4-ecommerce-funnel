import type { Metadata } from "next";
import { Cormorant_Garamond, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500"], style: ["normal", "italic"], variable: "--font-cormorant" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-hanken" });

export const metadata: Metadata = {
  metadataBase: new URL("https://ga4-ecommerce-funnel.vercel.app"),
  title: "Browsers × Buyers",
  description: "Where the Google Merchandise Store loses its shoppers: three months of Google Analytics 4 events, followed in BigQuery SQL.",
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${hanken.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
