import { redirect } from "next/navigation";

import LoginForm from "@/components/admin/login-form";
import { authConfigError, isAuthenticated } from "@/lib/auth";

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/admin");

  const configError = authConfigError();

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-2xl font-light tracking-tight text-brand-600">véa</p>
          <h1 className="mt-2 text-lg font-bold text-ink">لوحة التحكم</h1>
          <p className="mt-1 text-sm text-ink-soft">هذه الصفحة خاصة بإدارة الموقع.</p>
        </div>

        {configError ? (
          <div className="rounded-card border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
            <p className="font-semibold">لوحة التحكم غير مُعدّة بعد.</p>
            <p className="mt-2 leading-relaxed">{configError}</p>
            <p className="mt-3 leading-relaxed">
              شغّل هذا الأمر ثم ضع السطرين في ملف{" "}
              <code className="rounded bg-amber-100 px-1">.env.local</code>:
            </p>
            <pre
              dir="ltr"
              className="mt-2 overflow-x-auto rounded bg-amber-100 p-2 text-left text-xs"
            >
              node scripts/hash-password.mjs &quot;votre-mot-de-passe&quot;
            </pre>
          </div>
        ) : (
          <LoginForm />
        )}
      </div>
    </main>
  );
}
