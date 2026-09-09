import { notFound } from "next/navigation";

import HomeShowcase from "@/components/home-showcase";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { getContent } from "@/lib/content";
import { toCategoryViews, toProductViews, toSlideViews } from "@/lib/view";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const content = await getContent();

  return (
    <>
      <a
        href="#products"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-100 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        {dict.a11y.skipToContent}
      </a>

      <SiteHeader locale={lang} dict={dict} />

      <main className="flex-1">
        <HomeShowcase
          slides={toSlideViews(content, lang)}
          categories={toCategoryViews(content, lang)}
          products={toProductViews(content, lang, dict.units.ml)}
          locale={lang}
          dict={dict}
        />
      </main>

      <SiteFooter dict={dict} locale={lang} />
    </>
  );
}
