import Link from "next/link";
import { redirect } from "next/navigation";

import { logout } from "@/app/admin/actions";
import { defaultLocale } from "@/i18n/config";
import { isAuthenticated } from "@/lib/auth";

/**
 * Everything in this group is behind the session check. The login page sits
 * outside it so it stays reachable.
 *
 * This gate protects *navigation*; each Server Action re-checks the session
 * independently, because an action can be invoked without ever rendering a
 * page.
 */
export default async function ProtectedLayout({
  children,
}: LayoutProps<"/admin">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
          <div className="flex items-baseline gap-3">
            <Link
              href="/admin"
              className="text-xl font-light tracking-tight text-brand-600"
            >
              véa
            </Link>
            <span className="text-sm font-semibold text-ink">لوحة التحكم</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/${defaultLocale}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 hover:bg-brand-50 hover:text-brand-600"
            >
              عرض الموقع
            </Link>

            <form action={logout}>
              <button
                type="submit"
                className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
              >
                خروج
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8 md:py-12">{children}</main>
    </div>
  );
}
