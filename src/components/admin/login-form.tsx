"use client";

import { useActionState } from "react";

import { login, type ActionState } from "@/app/admin/actions";

const initial: ActionState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <form
      action={formAction}
      className="rounded-card border border-line bg-white p-6 shadow-soft"
    >
      <label htmlFor="password" className="block text-sm font-medium text-ink">
        كلمة السر
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        autoFocus
        className="mt-2 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-base text-ink outline-none transition-colors duration-200 focus:border-brand-400"
      />

      {state.error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 w-full cursor-pointer rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "جارٍ التحقق…" : "دخول"}
      </button>
    </form>
  );
}
