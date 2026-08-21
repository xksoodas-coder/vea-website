"use client";

import { useActionState, useState } from "react";

import { saveCompany, type ActionState } from "@/app/admin/actions";
import {
  AddRowButton,
  Card,
  ErrorNote,
  LocalizedField,
  LocalizedRowInputs,
  RowTools,
  SubmitBar,
  inputClass,
} from "@/components/admin/fields";
import {
  emptyLocalizedText,
  type CompanyProfile,
  type CompanyStat,
  type CompanyValue,
} from "@/lib/content-types";

const initial: ActionState = {};

/**
 * Repeatable rows are keyed by a counter rather than by array index so that
 * removing a row does not make React reuse the wrong uncontrolled input.
 */
type Keyed<T> = { key: number; row: T };

let nextKey = 0;
const keyed = <T,>(rows: T[]): Keyed<T>[] =>
  rows.map((row) => ({ key: nextKey++, row }));

export default function CompanyForm({ profile }: { profile: CompanyProfile }) {
  const [state, formAction, pending] = useActionState(saveCompany, initial);

  const [stats, setStats] = useState<Keyed<CompanyStat>[]>(() =>
    keyed(profile.stats),
  );
  const [values, setValues] = useState<Keyed<CompanyValue>[]>(() =>
    keyed(profile.values),
  );

  const addStat = () =>
    setStats((rows) => [
      ...rows,
      { key: nextKey++, row: { value: "", label: emptyLocalizedText() } },
    ]);

  const addValue = () =>
    setValues((rows) => [
      ...rows,
      {
        key: nextKey++,
        row: { title: emptyLocalizedText(), description: emptyLocalizedText() },
      },
    ]);

  return (
    <form action={formAction} className="grid gap-6">
      <Card
        title="مقدمة الصفحة"
        hint="العنوان والفقرة التعريفية اللذان يظهران في أعلى صفحة «عن شركتنا»."
      >
        <div className="grid gap-6">
          <LocalizedField
            name="headline"
            label="العنوان الرئيسي"
            value={profile.headline}
            hint="اتركه فارغاً لاستعمال العنوان الافتراضي «عن شركتنا»."
          />
          <LocalizedField
            name="intro"
            label="الفقرة التعريفية"
            value={profile.intro}
            rows={3}
          />
        </div>
      </Card>

      <Card
        title="أرقام بارزة"
        hint="تظهر في شريط أفقي تحت المقدمة — مثلاً «1998 / سنة التأسيس» أو «+250 / موظف»."
        actions={<AddRowButton onClick={addStat} label="إضافة رقم" />}
      >
        {stats.length === 0 ? (
          <p className="text-sm text-ink-faint">لا توجد أرقام بعد.</p>
        ) : (
          <ul className="grid gap-3">
            {stats.map(({ key, row }) => (
              <li
                key={key}
                className="flex flex-wrap items-start gap-2 rounded-lg border border-line bg-surface-2/60 p-3"
              >
                <input
                  name="stat.value"
                  defaultValue={row.value}
                  dir="ltr"
                  placeholder="1998"
                  aria-label="الرقم"
                  className={`${inputClass} max-w-28 text-start`}
                />
                <div className="min-w-56 flex-1">
                  <LocalizedRowInputs
                    name="stat.label"
                    value={row.label}
                    placeholder="التسمية"
                  />
                </div>
                <RowTools
                  onRemove={() =>
                    setStats((rows) => rows.filter((entry) => entry.key !== key))
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="قصة الشركة">
        <LocalizedField
          name="story"
          label="النص الكامل"
          value={profile.story}
          rows={7}
          hint="اترك سطراً فارغاً بين الفقرات ليتم فصلها في الموقع."
        />
      </Card>

      <Card title="الرسالة والرؤية">
        <div className="grid gap-6">
          <LocalizedField
            name="mission"
            label="رسالتنا"
            value={profile.mission}
            rows={4}
          />
          <LocalizedField
            name="vision"
            label="رؤيتنا"
            value={profile.vision}
            rows={4}
          />
        </div>
      </Card>

      <Card
        title="قيم الشركة"
        hint="بطاقات قصيرة: عنوان القيمة ثم شرح من سطر أو سطرين."
        actions={<AddRowButton onClick={addValue} label="إضافة قيمة" />}
      >
        {values.length === 0 ? (
          <p className="text-sm text-ink-faint">لا توجد قيم بعد.</p>
        ) : (
          <ul className="grid gap-4">
            {values.map(({ key, row }, index) => (
              <li
                key={key}
                className="rounded-lg border border-line bg-surface-2/60 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="tabular text-xs font-semibold text-ink-faint">
                    القيمة {index + 1}
                  </span>
                  <RowTools
                    onRemove={() =>
                      setValues((rows) =>
                        rows.filter((entry) => entry.key !== key),
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <LocalizedRowInputs
                    name="value.title"
                    value={row.title}
                    placeholder="العنوان"
                  />
                  <LocalizedRowInputs
                    name="value.description"
                    value={row.description}
                    placeholder="الشرح"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ErrorNote message={state.error} />

      <SubmitBar
        pending={pending}
        label="حفظ معلومات الشركة"
        pendingLabel="جارٍ الحفظ…"
      />
    </form>
  );
}
