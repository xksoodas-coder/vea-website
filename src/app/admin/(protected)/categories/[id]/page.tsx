import Link from "next/link";
import { notFound } from "next/navigation";

import CategoryForm from "@/components/admin/category-form";
import { getCategoryById } from "@/lib/categories";
import { pick } from "@/lib/content-types";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) notFound();

  return (
    <>
      <nav className="mb-6"><Link href="/admin/categories" className="text-sm font-medium text-ink-soft transition-colors hover:text-brand-600">← الرجوع إلى الفئات</Link></nav>
      <h1 className="mb-8 text-2xl font-bold text-ink">{pick(category.label, "ar") || pick(category.label, "fr") || "تعديل الفئة"}</h1>
      <CategoryForm category={category} />
    </>
  );
}
