import Link from "next/link";
import { notFound } from "next/navigation";

import ProductForm from "@/components/admin/product-form";
import { defaultLocale } from "@/i18n/config";
import { getContent } from "@/lib/content";
import { pick } from "@/lib/content-types";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const { products, categories } = await getContent();

  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  return (
    <>
      <nav className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/admin"
          className="text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-brand-600"
        >
          ← رجوع إلى المنتجات
        </Link>

        <Link
          href={`/${defaultLocale}/products/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-brand-600 transition-colors duration-200 hover:text-brand-700"
        >
          عرض في الموقع ↗
        </Link>
      </nav>

      <h1 className="mb-8 text-2xl font-bold text-ink">
        {pick(product.name, "ar") || pick(product.name, defaultLocale)}
      </h1>

      <ProductForm product={product} categories={categories} />
    </>
  );
}
