import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductsBrowser from "@/components/products-browser";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getDictionary } from "@/i18n";
import { isLocale, locales } from "@/i18n/config";
import { getContent } from "@/lib/content";
import { toCategoryViews, toProductViews } from "@/lib/view";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/products">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.productsPage.title,
    description: dict.productsPage.subtitle,
  };
}

export default async function ProductsPage({ params }: PageProps<"/[lang]/products">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const content = await getContent();

  return (
    <>
      <SiteHeader locale={lang} dict={dict} />

      <main className="flex-1">
        <div className="container-page section-space">
          <header className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-11">
            <div>
              <p className="eyebrow mb-4 text-rose-ink">{dict.nav.products}</p>
              <h1 className="text-[clamp(2.2rem,4vw,3.65rem)]">
                {dict.productsPage.title}
              </h1>
            </div>
            <p className="max-w-[340px] text-ink-soft">{dict.productsPage.subtitle}</p>
          </header>

          <ProductsBrowser
            categories={toCategoryViews(content, lang)}
            products={toProductViews(content, lang, dict.units.ml)}
            locale={lang}
            dict={dict}
          />
        </div>
      </main>

      <SiteFooter dict={dict} locale={lang} />
    </>
  );
}
