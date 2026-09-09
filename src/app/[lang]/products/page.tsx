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

      <main className="flex-1 py-14 md:py-20">
        <div className="mx-auto w-full max-w-[86rem] px-5 md:px-8">
          <header className="mb-10 text-center md:mb-14">
            <h1 className="text-3xl font-bold text-brand-600 md:text-[2.5rem]">
              {dict.productsPage.title}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-[0.9375rem] text-ink-soft">
              {dict.productsPage.subtitle}
            </p>
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
