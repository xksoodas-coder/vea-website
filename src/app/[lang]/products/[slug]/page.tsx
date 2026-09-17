import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowUpLeft, ChevronLeft } from "@/components/icons";
import ProductGallery from "@/components/product-gallery";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { getContent } from "@/lib/content";
import { toProductView } from "@/lib/view";

// Products live in Turso and are rendered on demand. New products therefore
// do not require a new Vercel build before their pages become available.
export const dynamic = "force-dynamic";

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

      <main className="flex-1">
        <div className="container-page py-8 md:py-14">
          {/* Breadcrumb */}
          <nav aria-label={dict.a11y.breadcrumb} className="mb-6 md:mb-10">
            <Link
              href={productsHref}
              className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors duration-200 hover:text-plum"
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
            <div className="flex flex-col lg:pt-6">
              {product.line && (
                <p className="eyebrow mb-4 text-rose-ink">{product.line}</p>
              )}

              <h1 className="text-[clamp(2.2rem,4vw,3.2rem)]">{product.name}</h1>

              {product.size && (
                <p className="tabular mt-5 inline-block w-fit rounded-[5px] bg-[#e8edde] px-2.5 py-1 text-sm text-[#3c4736]">
                  {product.size}
                </p>
              )}

              {product.description && (
                <p className="mt-6 leading-[1.8] text-ink-soft">{product.description}</p>
              )}

              {/* Spec rows — hairlines above and below, nothing boxed in. */}
              <dl className="mt-8 text-sm">
                {product.line && (
                  <div className="flex items-center justify-between gap-4 border-t border-line py-4">
                    <dt className="text-ink-soft">{dict.product.range}</dt>
                    <dd className="font-medium">{product.line}</dd>
                  </div>
                )}
                {product.size && (
                  <div className="flex items-center justify-between gap-4 border-y border-line py-4">
                    <dt className="text-ink-soft">{dict.product.volume}</dt>
                    <dd className="tabular font-medium">{product.size}</dd>
                  </div>
                )}
              </dl>

              <a href="#contact" className="btn btn-dark mt-8 w-full justify-between">
                {dict.nav.contact}
                <ArrowUpLeft className="size-5 -scale-x-100 rtl:scale-x-100" />
              </a>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter dict={dict} locale={lang} />
    </>
  );
}
