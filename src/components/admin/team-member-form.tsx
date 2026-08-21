"use client";

import Image from "next/image";
import { useActionState, useState } from "react";

import { saveTeamMember, type ActionState } from "@/app/admin/actions";
import {
  AddRowButton,
  Card,
  ErrorNote,
  LocalizedField,
  LocalizedRowInputs,
  RowTools,
  SortOrderField,
  SubmitBar,
  VisibleToggle,
  inputClass,
} from "@/components/admin/fields";
import {
  emptyLocalizedText,
  type DetailField,
  type StoredTeamMember,
} from "@/lib/content-types";

const initial: ActionState = {};

type Keyed = { key: number; row: DetailField };

let nextKey = 0;

export default function TeamMemberForm({
  member,
}: {
  member: StoredTeamMember | null;
}) {
  const [state, formAction, pending] = useActionState(saveTeamMember, initial);
  const [preview, setPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  const [details, setDetails] = useState<Keyed[]>(() =>
    (member?.details ?? []).map((row) => ({ key: nextKey++, row })),
  );

  const storedPhoto = removePhoto ? null : (member?.photo ?? null);
  const photo = preview ?? storedPhoto;

  const addDetail = () =>
    setDetails((rows) => [
      ...rows,
      {
        key: nextKey++,
        row: { label: emptyLocalizedText(), value: emptyLocalizedText() },
      },
    ]);

  return (
    <form action={formAction} className="grid gap-6">
      {member && <input type="hidden" name="id" value={member.id} />}

      <Card title="الاسم والمنصب">
        <div className="grid gap-6">
          <LocalizedField
            name="name"
            label="الاسم الكامل"
            value={member?.name ?? emptyLocalizedText()}
            hint="اكتب الاسم بلغة واحدة على الأقل؛ الموقع يستعمل اللغات الأخرى المتاحة كبديل."
            required
          />
          <LocalizedField
            name="role"
            label="المنصب"
            value={member?.role ?? emptyLocalizedText()}
            hint="مثلاً: المدير العام، مسؤولة الجودة، رئيس المخبر."
          />
          <LocalizedField
            name="bio"
            label="نبذة تعريفية"
            value={member?.bio ?? emptyLocalizedText()}
            rows={4}
          />
        </div>
      </Card>

      <Card
        title="الصورة الشخصية"
        hint="يُفضّل صورة عمودية قريبة من نسبة 4:5 لعرض متناسق في كل البطاقات."
      >
        {photo && (
          <div className="relative mb-4 h-44 w-36 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-line">
            {preview ? (
              // Local object URLs are not supported by next/image optimisation.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="size-full object-cover" />
            ) : (
              <Image src={photo} alt="" fill sizes="144px" className="object-cover" />
            )}
          </div>
        )}

        <label htmlFor="photo" className="block text-xs font-medium text-ink-soft">
          {photo ? "استبدال الصورة" : "اختيار صورة"}
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setPreview(URL.createObjectURL(file));
            setRemovePhoto(false);
          }}
          className="mt-1.5 block w-full cursor-pointer rounded-lg border border-dashed border-line bg-surface-2 px-3.5 py-3 text-sm text-ink-soft file:me-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
        />
        <p className="mt-1 text-xs text-ink-faint">
          JPG أو PNG أو WebP أو AVIF — حتى 5 ميغابايت. بدون صورة تظهر الأحرف الأولى من الاسم.
        </p>

        {member?.photo && !preview && (
          <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
            <input
              type="checkbox"
              name="removePhoto"
              checked={removePhoto}
              onChange={(event) => setRemovePhoto(event.target.checked)}
              className="size-4 cursor-pointer accent-red-600"
            />
            حذف الصورة الحالية
          </label>
        )}
      </Card>

      <Card
        title="معلومات إضافية اختيارية"
        hint="أي معلومة تريد إضافتها لهذا الشخص: التخصص، سنة الالتحاق، الشهادة… اكتب التسمية ثم القيمة."
        actions={<AddRowButton onClick={addDetail} label="إضافة معلومة" />}
      >
        {details.length === 0 ? (
          <p className="text-sm text-ink-faint">لا توجد معلومات إضافية.</p>
        ) : (
          <ul className="grid gap-4">
            {details.map(({ key, row }, index) => (
              <li
                key={key}
                className="rounded-lg border border-line bg-surface-2/60 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="tabular text-xs font-semibold text-ink-faint">
                    معلومة {index + 1}
                  </span>
                  <RowTools
                    onRemove={() =>
                      setDetails((rows) =>
                        rows.filter((entry) => entry.key !== key),
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <LocalizedRowInputs
                    name="detail.label"
                    value={row.label}
                    placeholder="التسمية"
                  />
                  <LocalizedRowInputs
                    name="detail.value"
                    value={row.value}
                    placeholder="القيمة"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="وسائل التواصل" hint="اختيارية — تظهر كأيقونات أسفل البطاقة.">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="email" className="text-xs font-medium text-ink-soft">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              name="email"
              type="email"
              dir="ltr"
              defaultValue={member?.email ?? ""}
              placeholder="nom@vea-dz.com"
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
          <div>
            <label htmlFor="phone" className="text-xs font-medium text-ink-soft">
              الهاتف
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              dir="ltr"
              defaultValue={member?.phone ?? ""}
              placeholder="+213 ..."
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
          <div>
            <label htmlFor="linkedin" className="text-xs font-medium text-ink-soft">
              رابط LinkedIn
            </label>
            <input
              id="linkedin"
              name="linkedin"
              type="url"
              dir="ltr"
              defaultValue={member?.linkedin ?? ""}
              placeholder="https://linkedin.com/in/..."
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
        </div>
      </Card>

      <Card title="الترتيب والظهور">
        <div className="grid gap-4">
          <SortOrderField defaultValue={member?.sortOrder ?? 0} />
          <VisibleToggle defaultChecked={member?.visible ?? true} />
        </div>
      </Card>

      <ErrorNote message={state.error} />

      <SubmitBar
        pending={pending}
        label="حفظ الموظف"
        pendingLabel="جارٍ الحفظ…"
        cancelHref="/admin/team"
      />
    </form>
  );
}
