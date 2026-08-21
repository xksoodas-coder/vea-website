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
  type CompanyProfile,
  type LocalizedText,
  type StoredGalleryItem,
  type StoredProduct,
  type StoredTeamMember,
} from "@/lib/content-types";
import {
  deleteProductRecord,
  getProductById,
  getProductBySlug,
  getProducts,
  saveProductRecord,
} from "@/lib/products";
import {
  deleteBannerRecord,
  getBannerById,
  saveBannerRecord,
} from "@/lib/banners";
import {
  deleteCategoryRecord,
  getCategoryById,
  saveCategoryRecord,
} from "@/lib/categories";
import { saveCompanyProfile } from "@/lib/company";
import {
  deleteTeamMemberRecord,
  getTeamMemberById,
  saveTeamMemberRecord,
} from "@/lib/team";
import {
  deleteGalleryItemRecord,
  getGalleryItemById,
  saveGalleryItemRecord,
} from "@/lib/gallery";
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

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

function revalidateCategories() {
  for (const locale of locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/products`);
  }
}

export async function saveCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const existingId = String(formData.get("id") ?? "").trim();
  const existing = existingId ? await getCategoryById(existingId) : undefined;
  const label = readLocalized(formData, "label");
  const primaryLabel = label.fr || label.ar || label.en;
  if (!primaryLabel) {
    return { error: "أدخل اسم الفئة بلغة واحدة على الأقل." };
  }

  const requestedId = String(formData.get("categoryId") ?? "").trim();
  const id = existing?.id ?? slugify(requestedId || primaryLabel).replace(/^produit-/, "category-");

  if (!existing && (await getCategoryById(id))) {
    return { error: "هذا المعرّف مستخدم لفئة أخرى. غيّره أو اتركه فارغاً." };
  }

  let image = existing?.image ?? null;
  const upload = formFile(formData, "image");
  if (upload) {
    const result = await saveUploadedImage(upload, "categories");
    if (!result.ok) {
      return {
        error:
          result.reason === "storage-error"
            ? "تعذر رفع الصورة إلى Cloudflare R2. تحقق من متغيرات R2 في Vercel."
            : "الصورة يجب أن تكون JPG أو PNG أو WebP أو AVIF وبحد أقصى 5 ميغابايت.",
      };
    }
    image = result.url;
  }

  await saveCategoryRecord({ id, label, image });
  if (existing?.image && existing.image !== image) {
    await deleteUploadedImage(existing.image);
  }

  revalidateCategories();
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const category = await getCategoryById(id);
  if (category) {
    // Keep existing products valid when a category is removed.
    const products = await getProducts();
    for (const product of products) {
      if (!product.categoryIds.includes(id)) continue;
      await saveProductRecord({
        ...product,
        categoryIds: product.categoryIds.filter((categoryId) => categoryId !== id),
      });
    }

    await deleteCategoryRecord(id);
    if (category.image) await deleteUploadedImage(category.image);
    revalidateCategories();
  }

  redirect("/admin/categories");
}

/* -------------------------------------------------------------------------- */
/* Company profile, team and gallery — the About page                         */
/* -------------------------------------------------------------------------- */

function revalidateAbout() {
  for (const locale of locales) revalidatePath(`/${locale}/about`);
}

/**
 * Reads a repeated group of localized inputs into rows. Every row renders one
 * input per language, so `getAll` returns aligned, gap-free columns no matter
 * which rows the admin added or removed before submitting.
 */
function readLocalizedRows(formData: FormData, field: string): LocalizedText[] {
  const columns = locales.map((locale) =>
    formData.getAll(`${field}.${locale}`).map((entry) => String(entry).trim()),
  );
  const rowCount = Math.max(0, ...columns.map((column) => column.length));

  return Array.from({ length: rowCount }, (_, row) => {
    const text = emptyLocalizedText();
    locales.forEach((locale, column) => {
      text[locale] = columns[column][row] ?? "";
    });
    return text;
  });
}

const trimmed = (formData: FormData, field: string): string =>
  String(formData.get(field) ?? "").trim();

/** Empty or non-numeric input sorts to 0, which lets created_at break the tie. */
function readSortOrder(formData: FormData): number {
  const raw = trimmed(formData, "sortOrder");
  const parsed = Number(raw);
  return raw !== "" && Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

function uploadErrorMessage(reason: string): string {
  if (reason === "storage-error") {
    return "تعذر رفع الصورة إلى Cloudflare R2. تحقق من متغيرات R2 في Vercel.";
  }
  return reason === "too-large"
    ? "حجم الصورة يتجاوز 5 ميغابايت."
    : "صيغة الصورة غير مدعومة. استعمل JPG أو PNG أو WebP أو AVIF.";
}

/* ------------------------------- Profile ---------------------------------- */

export async function saveCompany(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const statValues = formData.getAll("stat.value").map((v) => String(v).trim());
  const statLabels = readLocalizedRows(formData, "stat.label");

  const valueTitles = readLocalizedRows(formData, "value.title");
  const valueDescriptions = readLocalizedRows(formData, "value.description");

  const profile: CompanyProfile = {
    headline: readLocalized(formData, "headline"),
    intro: readLocalized(formData, "intro"),
    story: readLocalized(formData, "story"),
    mission: readLocalized(formData, "mission"),
    vision: readLocalized(formData, "vision"),
    // Rows left completely blank are dropped rather than stored.
    stats: statLabels
      .map((label, index) => ({ value: statValues[index] ?? "", label }))
      .filter((stat) => stat.value || locales.some((l) => stat.label[l])),
    values: valueTitles
      .map((title, index) => ({
        title,
        description: valueDescriptions[index] ?? emptyLocalizedText(),
      }))
      .filter((value) => locales.some((l) => value.title[l] || value.description[l])),
  };

  await saveCompanyProfile(profile);
  revalidateAbout();

  redirect("/admin/company");
}

/* -------------------------------- Team ------------------------------------ */

export async function saveTeamMember(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = trimmed(formData, "id");
  const existing = id ? await getTeamMemberById(id) : undefined;

  const name = readLocalized(formData, "name");
  if (!locales.some((l) => name[l])) {
    return { error: "أدخل اسم الموظف بلغة واحدة على الأقل." };
  }

  /* --- photo: replace, keep, or clear ----------------------------------- */
  let photo = existing?.photo ?? null;
  const removePhoto = formData.get("removePhoto") === "on";
  const upload = formFile(formData, "photo");

  if (upload) {
    const result = await saveUploadedImage(upload, "team");
    if (!result.ok) return { error: uploadErrorMessage(result.reason) };
    photo = result.url;
  } else if (removePhoto) {
    photo = null;
  }

  /* --- optional extra facts --------------------------------------------- */
  const detailLabels = readLocalizedRows(formData, "detail.label");
  const detailValues = readLocalizedRows(formData, "detail.value");
  const details = detailLabels
    .map((label, index) => ({
      label,
      value: detailValues[index] ?? emptyLocalizedText(),
    }))
    .filter((detail) => locales.some((l) => detail.label[l] || detail.value[l]));

  const member: StoredTeamMember = {
    id: existing?.id ?? `m-${Date.now().toString(36)}`,
    name,
    role: readLocalized(formData, "role"),
    bio: readLocalized(formData, "bio"),
    photo,
    email: trimmed(formData, "email"),
    phone: trimmed(formData, "phone"),
    linkedin: trimmed(formData, "linkedin"),
    details,
    sortOrder: readSortOrder(formData),
    visible: formData.get("visible") === "on",
  };

  await saveTeamMemberRecord(member);

  if (existing?.photo && existing.photo !== photo) {
    await deleteUploadedImage(existing.photo);
  }

  revalidateAbout();
  redirect("/admin/team");
}

export async function deleteTeamMember(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const member = await getTeamMemberById(id);
  if (member) {
    await deleteTeamMemberRecord(id);
    if (member.photo) await deleteUploadedImage(member.photo);
    revalidateAbout();
  }

  redirect("/admin/team");
}

/** One-click show/hide straight from the list, without opening the form. */
export async function toggleTeamMemberVisibility(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const member = await getTeamMemberById(id);
  if (member) {
    await saveTeamMemberRecord({ ...member, visible: !member.visible });
    revalidateAbout();
  }

  redirect("/admin/team");
}

/* ------------------------------- Gallery ---------------------------------- */

export async function saveGalleryItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = trimmed(formData, "id");
  const existing = id ? await getGalleryItemById(id) : undefined;

  let image = existing?.image ?? "";
  const upload = formFile(formData, "image");
  if (upload) {
    const result = await saveUploadedImage(upload, "gallery");
    if (!result.ok) return { error: uploadErrorMessage(result.reason) };
    image = result.url;
  }

  if (!image) return { error: "أضف صورة أولًا." };

  const item: StoredGalleryItem = {
    id: existing?.id ?? `g-${Date.now().toString(36)}`,
    image,
    title: readLocalized(formData, "title"),
    description: readLocalized(formData, "description"),
    sortOrder: readSortOrder(formData),
    visible: formData.get("visible") === "on",
  };

  await saveGalleryItemRecord(item);

  if (existing?.image && existing.image !== image) {
    await deleteUploadedImage(existing.image);
  }

  revalidateAbout();
  redirect("/admin/gallery");
}

export async function deleteGalleryItem(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const item = await getGalleryItemById(id);
  if (item) {
    await deleteGalleryItemRecord(id);
    await deleteUploadedImage(item.image);
    revalidateAbout();
  }

  redirect("/admin/gallery");
}

/** One-click show/hide straight from the list, without opening the form. */
export async function toggleGalleryItemVisibility(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const item = await getGalleryItemById(id);
  if (item) {
    await saveGalleryItemRecord({ ...item, visible: !item.visible });
    revalidateAbout();
  }

  redirect("/admin/gallery");
}
