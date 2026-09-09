import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ChevronLeft } from "@/components/icons";
import ProductGallery from "@/components/product-gallery";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getDictionary } from "@/i18n";
import { isLocale, locales } from "@/i18n/config";
import { getContent } from "@/lib/content";
import { toProductView } from "@/lib/view";

export async function generateStaticParams() {
  const { products } = await getContent();
  return locales.flatMap((lang) => products.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/products/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};

  const dict = getDictionary(lang);
  const { products } = await getContent();
  const stored = products.find((p) => p.slug === slug);
  if (!stored) return { title: dict.product.notFound };

  const product = toProductView(stored, lang, dict.units.ml);
  return {
    title: product.name,
    description: product.description || dict.meta.description,
    openGraph: { title: product.name, description: product.description },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/[lang]/products/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const { products } = await getContent();
  const stored = products.find((p) => p.slug === slug);
  if (!stored) notFound();

  const product = toProductView(stored, lang, dict.units.ml);
  const productsHref = `/${lang}/products`;

  return (
    <>
      <SiteHeader locale={lang} dict={dict} />

      <main className="flex-1 py-8 md:py-14">
        <div className="mx-auto w-full max-w-[86rem] px-5 md:px-8">
          {/* Breadcrumb */}
          <nav aria-label={dict.a11y.breadcrumb} className="mb-6 md:mb-10">
            <Link
              href={productsHref}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-brand-600"
            >
              <ChevronLeft className="size-4 rtl:rotate-180" />
              {dict.product.back}
            </Link>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <ProductGallery
              images={product.images}
              alt={product.name}
              dict={dict}
            />

            {/* Information column */}
            <div className="flex flex-col">
              {product.line && (
                <p className="text-xs font-semibold tracking-[0.16em] text-brand-600 uppercase">
                  {product.line}
                </p>
              )}

              <h1 className="mt-3 text-3xl leading-tight font-bold text-ink md:text-[2.5rem]">
                {product.name}
              </h1>

              {product.size && (
                <p className="mt-4 inline-flex w-fit items-baseline gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                  <span className="text-xs font-medium tracking-wide text-brand-600/80 uppercase">
                    {dict.product.volume}
                  </span>
                  <span className="tabular">{product.size}</span>
                </p>
              )}

              {product.description && (
                <section className="mt-8 border-t border-line pt-8">
                  <h2 className="text-xs font-semibold tracking-[0.16em] text-ink-soft uppercase">
                    {dict.product.description}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-ink-soft">
                    {product.description}
                  </p>
                </section>
              )}

              <dl className="mt-8 grid gap-px overflow-hidden rounded-card border border-line bg-line text-sm">
                {product.line && (
                  <div className="flex items-baseline justify-between gap-4 bg-white px-5 py-4">
                    <dt className="font-medium text-ink-soft">{dict.product.range}</dt>
                    <dd className="font-semibold text-ink">{product.line}</dd>
                  </div>
                )}
                {product.size && (
                  <div className="flex items-baseline justify-between gap-4 bg-white px-5 py-4">
                    <dt className="font-medium text-ink-soft">{dict.product.volume}</dt>
                    <dd className="tabular font-semibold text-ink">{product.size}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter dict={dict} locale={lang} />
    </>
  );
}
