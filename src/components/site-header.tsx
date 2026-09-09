"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Close, Menu } from "@/components/icons";
import LanguageSwitcher from "@/components/language-switcher";
import { site } from "@/data/site";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

export default function SiteHeader({ locale, dict }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [section, setSection] = useState("#top");

  const home = `/${locale}`;
  const isHome = pathname === home;
  const onProducts = pathname.startsWith(`${home}/products`);

  /*
    On the homepage the first and last items are in-page anchors so they
    scroll; anywhere else they become real links back to the homepage.
  */
  const nav = [
    {
      key: "home",
      label: dict.nav.home,
      href: isHome ? "#top" : home,
      active: isHome && section === "#top",
    },
    {
      key: "products",
      label: dict.nav.products,
      href: `${home}/products`,
      active: onProducts,
    },
    {
      key: "contact",
      label: dict.nav.contact,
      href: isHome ? "#contact" : `${home}#contact`,
      active: isHome && section === "#contact",
    },
  ];

  /* Subtle elevation once the page leaves the top. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Scrollspy for the in-page anchors, homepage only. */
  useEffect(() => {
    if (!isHome) return;

    const sections = ["#top", "#products", "#contact"]
      .map((id) => document.querySelector<HTMLElement>(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setSection(`#${visible.target.id}`);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [isHome]);

  /* The mobile sheet closes from each link's onClick; Escape closes it too. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const linkFor = (href: string) => (href.startsWith("#") ? "a" : Link);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-line bg-white/85 backdrop-blur-lg supports-[backdrop-filter]:bg-white/70"
          : "border-transparent bg-white"
      }`}
    >
      <div className="container-page">
        <nav
          aria-label={dict.a11y.mainNav}
          className="flex h-16 items-center justify-between gap-4"
        >
          {/* Start side: logo + links, pinned to the edge. */}
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={home}
              aria-label={`${site.brand} — ${dict.a11y.homeLink}`}
              className="shrink-0 rounded-lg transition-opacity duration-200 hover:opacity-75 md:me-6"
            >
              <Image
                src={site.logo.src}
                alt={site.logo.alt}
                width={site.logo.width}
                height={site.logo.height}
                priority
                className="h-9 w-auto"
              />
            </Link>

            <ul className="hidden items-center gap-1 md:flex">
              {nav.map((item) => {
                const Tag = linkFor(item.href);
                return (
                  <li key={item.key}>
                    <Tag
                      href={item.href}
                      aria-current={item.active ? "page" : undefined}
                      className={`relative block rounded-lg px-4 py-2 text-[0.9375rem] transition-colors duration-200 ${
                        item.active
                          ? "font-semibold text-brand-600"
                          : "font-medium text-ink-soft hover:text-brand-600"
                      }`}
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-4 bottom-1 h-px origin-center bg-brand-600 transition-transform duration-300 ${
                          item.active ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </Tag>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* End side: language switcher, and the mobile menu trigger. */}
          <div className="flex shrink-0 items-center gap-1">
            <LanguageSwitcher locale={locale} label={dict.a11y.language} />

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? dict.a11y.closeMenu : dict.a11y.openMenu}
              className="-me-2 flex size-11 cursor-pointer items-center justify-center rounded-lg text-ink transition-colors duration-200 hover:bg-brand-50 md:hidden"
            >
              {open ? <Close className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile sheet */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-line bg-white md:hidden"
      >
        <ul className="container-page flex flex-col py-2">
          {nav.map((item) => {
            const Tag = linkFor(item.href);
            return (
              <li key={item.key}>
                <Tag
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3.5 text-base font-medium text-ink transition-colors duration-200 hover:bg-brand-50 hover:text-brand-600"
                >
                  {item.label}
                </Tag>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
