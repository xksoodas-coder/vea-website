"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { locales } from "@/i18n/config";
import {
  createSession,
  destroySession,
  requireAdmin,
  throttleCheck,
  throttleFail,
  throttleReset,
  verifyPassword,
} from "@/lib/auth";
import { getContent, saveContent } from "@/lib/content";
import {
  emptyLocalizedText,
  type LocalizedText,
  type StoredProduct,
} from "@/lib/content-types";
import { deleteUploadedImage, saveUploadedImage } from "@/lib/uploads";

export type ActionState = { error?: string; ok?: boolean };

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

async function clientKey(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown"
  );
}

export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const key = await clientKey();

  const { blocked, retryInMs } = throttleCheck(key);
  if (blocked) {
    const minutes = Math.ceil(retryInMs / 60000);
    return { error: `محاولات كثيرة. أعد المحاولة بعد ${minutes} دقيقة.` };
  }

  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "أدخل كلمة السر." };

  if (!(await verifyPassword(password))) {
    throttleFail(key);
    return { error: "كلمة السر غير صحيحة." };
  }

  throttleReset(key);
  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

/* -------------------------------------------------------------------------- */
/* Products                                                                   */
/* -------------------------------------------------------------------------- */

function readLocalized(formData: FormData, field: string): LocalizedText {
  const value = emptyLocalizedText();
  for (const locale of locales) {
    value[locale] = String(formData.get(`${field}.${locale}`) ?? "").trim();
  }
  return value;
}

function slugify(input: string): string {
  const cleaned = input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return cleaned || `produit-${Date.now().toString(36)}`;
}

/** Revalidates every locale variant of the pages a product appears on. */
function revalidateProduct(slug?: string) {
  for (const locale of locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/products`);
    if (slug) revalidatePath(`/${locale}/products/${slug}`);
  }
}

export async function saveProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const name = readLocalized(formData, "name");

  const primaryName = name.fr || name.ar || name.en;
  if (!primaryName) {
    return { error: "أدخل اسم المنتج بلغة واحدة على الأقل." };
  }

  const content = await getContent();
  const existing = id ? content.products.find((p) => p.id === id) : undefined;

  /* --- images: ordered survivors first, then new uploads ---------------- */
  const keptImages = formData.getAll("existingImages").map(String).filter(Boolean);

  const uploads = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  const newImages: string[] = [];
  for (const file of uploads) {
    const result = await saveUploadedImage(file);
    if (!result.ok) {
      return {
        error:
          result.reason === "too-large"
            ? "حجم الصورة يتجاوز 5 ميغابايت."
            : "صيغة الصورة غير مدعومة. استعمل JPG أو PNG أو WebP أو AVIF.",
      };
    }
    newImages.push(result.url);
  }

  const images = [...keptImages, ...newImages];

  /* --- delete files dropped from an existing product -------------------- */
  if (existing) {
    for (const url of existing.images) {
      if (!images.includes(url)) await deleteUploadedImage(url);
    }
  }

  const rawVolume = String(formData.get("volumeMl") ?? "").trim();
  const volumeMl = rawVolume === "" ? null : Number(rawVolume);
  if (volumeMl !== null && (!Number.isFinite(volumeMl) || volumeMl <= 0)) {
    return { error: "الحجم بالمليلتر يجب أن يكون رقمًا موجبًا." };
  }

  const sizeLabel = readLocalized(formData, "sizeLabel");
  const hasSizeLabel = locales.some((l) => sizeLabel[l]);

  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || name.fr || name.en || primaryName);

  if (content.products.some((p) => p.slug === slug && p.id !== existing?.id)) {
    return { error: "هذا الرابط (slug) مستعمل من طرف منتج آخر." };
  }

  const product: StoredProduct = {
    id: existing?.id ?? `p-${Date.now().toString(36)}`,
    slug,
    name,
    description: readLocalized(formData, "description"),
    line: readLocalized(formData, "line"),
    volumeMl,
    sizeLabel: hasSizeLabel ? sizeLabel : null,
    categoryIds: formData.getAll("categoryIds").map(String),
    images,
  };

  const products = existing
    ? content.products.map((p) => (p.id === existing.id ? product : p))
    : [...content.products, product];

  await saveContent({ ...content, products });

  revalidateProduct(product.slug);
  if (existing && existing.slug !== product.slug) revalidateProduct(existing.slug);

  redirect("/admin");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const content = await getContent();
  const target = content.products.find((p) => p.id === id);

  if (target) {
    for (const url of target.images) await deleteUploadedImage(url);
    await saveContent({
      ...content,
      products: content.products.filter((p) => p.id !== id),
    });
    revalidateProduct(target.slug);
  }

  redirect("/admin");
}
