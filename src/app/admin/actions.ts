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
import {
  emptyLocalizedText,
  type LocalizedText,
  type StoredProduct,
} from "@/lib/content-types";
import {
  deleteProductRecord,
  getProductById,
  getProductBySlug,
  saveProductRecord,
} from "@/lib/products";
import {
  deleteBannerRecord,
  getBannerById,
  saveBannerRecord,
} from "@/lib/banners";
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

  const existing = id ? await getProductById(id) : undefined;

  /* --- images: ordered survivors first, then new uploads ---------------- */
  const keptImages = formData.getAll("existingImages").map(String).filter(Boolean);

  const uploads = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  const newImages: string[] = [];
  for (const file of uploads) {
    const result = await saveUploadedImage(file);
    if (!result.ok) {
      if (result.reason === "storage-error") {
        return {
          error: "تعذر رفع الصورة إلى Cloudflare R2. تحقق من متغيرات R2 في Vercel ثم أعد المحاولة.",
        };
      }
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

  const productWithSlug = await getProductBySlug(slug);
  if (productWithSlug && productWithSlug.id !== existing?.id) {
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

  await saveProductRecord(product);

  revalidateProduct(product.slug);
  if (existing && existing.slug !== product.slug) revalidateProduct(existing.slug);

  redirect("/admin");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const target = await getProductById(id);

  if (target) {
    for (const url of target.images) await deleteUploadedImage(url);
    await deleteProductRecord(id);
    revalidateProduct(target.slug);
  }

  redirect("/admin");
}

/* -------------------------------------------------------------------------- */
/* Banners                                                                    */
/* -------------------------------------------------------------------------- */

function revalidateBanners() {
  for (const locale of locales) revalidatePath(`/${locale}`);
}

function formFile(formData: FormData, field: string): File | undefined {
  const value = formData.get(field);
  return value instanceof File && value.size > 0 ? value : undefined;
}

export async function saveBanner(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const existing = id ? await getBannerById(id) : undefined;
  const desktopUpload = formFile(formData, "desktopImage");
  const mobileUpload = formFile(formData, "mobileImage");

  let desktopImage = existing?.desktopImage ?? "";
  let mobileImage = existing?.mobileImage ?? null;

  if (desktopUpload) {
    const result = await saveUploadedImage(desktopUpload, "banners");
    if (!result.ok) return { error: "صورة الحاسوب يجب أن تكون JPG أو PNG أو WebP أو AVIF وبحد أقصى 5 ميغابايت." };
    desktopImage = result.url;
  }

  if (!desktopImage) return { error: "أضف صورة إعلان للحاسوب أولًا." };

  if (mobileUpload) {
    const result = await saveUploadedImage(mobileUpload, "banners");
    if (!result.ok) return { error: "صورة الهاتف يجب أن تكون JPG أو PNG أو WebP أو AVIF وبحد أقصى 5 ميغابايت." };
    mobileImage = result.url;
  }

  const banner = {
    id: existing?.id ?? `b-${Date.now().toString(36)}`,
    desktopImage,
    mobileImage,
    alt: readLocalized(formData, "alt"),
    href: String(formData.get("href") ?? "").trim(),
    sortOrder: existing?.sortOrder ?? Date.now(),
  };

  await saveBannerRecord(banner);

  if (existing?.desktopImage && existing.desktopImage !== desktopImage) {
    await deleteUploadedImage(existing.desktopImage);
  }
  if (existing?.mobileImage && existing.mobileImage !== mobileImage) {
    await deleteUploadedImage(existing.mobileImage);
  }

  revalidateBanners();
  redirect("/admin/banners");
}

export async function deleteBanner(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const banner = await getBannerById(id);
  if (banner) {
    await deleteBannerRecord(id);
    await deleteUploadedImage(banner.desktopImage);
    if (banner.mobileImage && banner.mobileImage !== banner.desktopImage) {
      await deleteUploadedImage(banner.mobileImage);
    }
    revalidateBanners();
  }

  redirect("/admin/banners");
}
