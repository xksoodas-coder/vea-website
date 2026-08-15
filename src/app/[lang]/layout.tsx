import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";

import { site } from "@/data/site";
import { getDictionary } from "@/i18n";
import { dirOf, isLocale, localeTags, locales } from "@/i18n/config";
import "../globals.css";

/* Self-hosted by next/font — no request to Google at runtime. Covers Arabic
   and Latin, so all three locales share one family. */
const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = getDictionary(lang);

  return {
    metadataBase: undefined,
    title: {
      default: `${site.brand} — ${dict.meta.tagline}`,
      template: `%s | ${site.brand}`,
    },
    description: dict.meta.description,
    applicationName: site.brand,
    openGraph: {
      type: "website",
      locale: localeTags[lang],
      siteName: site.brand,
      title: `${site.brand} — ${dict.meta.tagline}`,
      description: dict.meta.description,
    },
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [localeTags[l], `/${l}`])),
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#14357f",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      dir={dirOf(lang)}
      className={`${arabic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface">{children}</body>
    </html>
  );
}
