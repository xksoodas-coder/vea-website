import Link from "next/link";

import CategoryForm from "@/components/admin/category-form";

export default function NewCategoryPage() {
  return (
    <>
      <nav className="mb-6"><Link href="/admin/categories" className="text-sm font-medium text-ink-soft transition-colors hover:text-brand-600">← الرجوع إلى الفئات</Link></nav>
      <h1 className="mb-8 text-2xl font-bold text-ink">فئة جديدة</h1>
      <CategoryForm category={null} />
    </>
  );
}
