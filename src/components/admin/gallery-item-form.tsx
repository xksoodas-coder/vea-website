"use client";

import Image from "next/image";
import { useActionState, useState } from "react";

import { saveGalleryItem, type ActionState } from "@/app/admin/actions";
import {
  Card,
  ErrorNote,
  LocalizedField,
  SortOrderField,
  SubmitBar,
  VisibleToggle,
} from "@/components/admin/fields";
import { emptyLocalizedText, type StoredGalleryItem } from "@/lib/content-types";

const initial: ActionState = {};

export default function GalleryItemForm({
  item,
}: {
  item: StoredGalleryItem | null;
}) {
  const [state, formAction, pending] = useActionState(saveGalleryItem, initial);
  const [preview, setPreview] = useState<string | null>(null);
  const image = preview ?? item?.image ?? null;

  return (
    <form action={formAction} className="grid gap-6">
      {item && <input type="hidden" name="id" value={item.id} />}

      <Card
        title="الصورة"
        hint="يُفضّل صورة أفقية قريبة من نسبة 4:3 لعرض متناسق في شبكة الصور."
      >
        {image && (
          <div className="relative mb-4 aspect-4/3 w-full max-w-sm overflow-hidden rounded-lg bg-surface-2 ring-1 ring-line">
            {preview ? (
              // Local object URLs are not supported by next/image optimisation.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="size-full object-cover" />
            ) : (
              <Image
                src={image}
                alt=""
                fill
                sizes="384px"
                className="object-cover"
              />
            )}
          </div>
        )}

        <label htmlFor="image" className="block text-xs font-medium text-ink-soft">
          {image ? "استبدال الصورة" : "اختيار صورة"}
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
          className="mt-1.5 block w-full cursor-pointer rounded-lg border border-dashed border-line bg-surface-2 px-3.5 py-3 text-sm text-ink-soft file:me-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
        />
        <p className="mt-1 text-xs text-ink-faint">
          JPG أو PNG أو WebP أو AVIF — حتى 5 ميغابايت.
        </p>
      </Card>

      <Card title="معلومات الصورة" hint="تظهر تحت الصورة في صفحة «عن شركتنا».">
        <div className="grid gap-6">
          <LocalizedField
            name="title"
            label="العنوان"
            value={item?.title ?? emptyLocalizedText()}
          />
          <LocalizedField
            name="description"
            label="الوصف"
            value={item?.description ?? emptyLocalizedText()}
            rows={3}
          />
        </div>
      </Card>

      <Card title="الترتيب والظهور">
        <div className="grid gap-4">
          <SortOrderField defaultValue={item?.sortOrder ?? 0} />
          <VisibleToggle defaultChecked={item?.visible ?? true} />
        </div>
      </Card>

      <ErrorNote message={state.error} />

      <SubmitBar
        pending={pending}
        label="حفظ الصورة"
        pendingLabel="جارٍ الحفظ…"
        cancelHref="/admin/gallery"
      />
    </form>
  );
}
