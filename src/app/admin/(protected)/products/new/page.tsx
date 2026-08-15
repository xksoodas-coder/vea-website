import Link from "next/link";

import ProductForm from "@/components/admin/product-form";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const { categories } = await getContent();

  return (
    <>
      <nav className="mb-6">
        <Link
          href="/admin"
          className="text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-brand-600"
        >
          ← رجوع إلى المنتجات
        </Link>
      </nav>

      <h1 className="mb-8 text-2xl font-bold text-ink">منتج جديد</h1>

      <ProductForm product={null} categories={categories} />
    </>
  );
}
