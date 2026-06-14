import type { Metadata } from "next";
import { Noto_Serif_TC, Noto_Sans_TC } from "next/font/google";
import "./globals.css";

// CJK fonts: no `subsets` — next/font types don't expose chinese-traditional
// Weights: 400/700/900 ONLY — 500 removed (locked in design review D13)
const serifTC = Noto_Serif_TC({
  weight: ["400", "700", "900"],
  display: "swap",
  variable: "--font-serif-tc",
  preload: false,
});

const sansTC = Noto_Sans_TC({
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-sans-tc",
  preload: false,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://afterhours.film";

export const metadata: Metadata = {
  title: {
    default: "散場之後",
    template: "%s — 散場之後",
  },
  description: "一份個人藝術電影日誌・每夜更新",
  alternates: {
    types: {
      "application/rss+xml": `${SITE_URL}/rss.xml`,
    },
  },
  openGraph: {
    siteName: "散場之後",
    locale: "zh_TW",
    type: "website",
    images: [{ url: `${SITE_URL}/og`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: [`${SITE_URL}/og`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className={`${serifTC.variable} ${sansTC.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
