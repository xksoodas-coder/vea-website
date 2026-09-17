"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ArrowUpLeft, Phone } from "@/components/icons";
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
  const [section, setSection] = useState("#top");

  const home = `/${locale}`;
  const isHome = pathname === home;
  const onProducts = pathname.startsWith(`${home}/products`);
  const onAbout = pathname.startsWith(`${home}/about`);

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
      key: "about",
      label: dict.nav.about,
      href: `${home}/about`,
      active: onAbout,
    },
    {
      /* Every page renders the contact block above its footer, so this is
         always an in-page jump — never a trip back to the homepage. */
      key: "contact",
      label: dict.nav.contact,
      href: "#contact",
      active: section === "#contact",
    },
  ];

  /* Scrollspy for the in-page anchors. */
  useEffect(() => {
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
  }, [pathname]);

  /* The mobile sheet closes from each link's onClick; Escape closes it too. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const linkFor = (href: string) => (href.startsWith("#") ? "a" : Link);
  const phone = site.contact.phones[0];

  return (
    <>
      {/* -------- Sage announcement strip, above the sticky header -------- */}
      <div className="flex min-h-[35px] items-center justify-center gap-5 bg-sage px-[6%] py-[7px] text-xs tracking-[0.035em] text-[#354230] md:justify-between">
        <span className="hidden md:block">{dict.meta.tagline}</span>
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="hidden items-center gap-2 transition-opacity duration-200 hover:opacity-70 md:flex"
        >
          <Phone className="size-[15px]" />
          <span dir="ltr" className="tabular">
            {phone}
          </span>
        </a>
        <span className="md:hidden">{dict.meta.tagline}</span>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-ivory">
        <nav
          aria-label={dict.a11y.mainNav}
          className="flex h-[78px] items-center justify-between gap-3 px-[6%] md:h-[101px] md:gap-8"
        >
          <Link
            href={home}
            aria-label={`${site.brand} — ${dict.a11y.homeLink}`}
            className="shrink-0 rounded-lg transition-opacity duration-200 hover:opacity-75"
          >
            <Image
              src={site.logo.src}
              alt={site.logo.alt}
              width={site.logo.width}
              height={site.logo.height}
              priority
              className="h-12 w-auto md:h-16"
            />
          </Link>

          {/* Desktop links — underline grows in from the start edge. */}
          <ul className="ms-auto hidden items-center gap-6 md:flex lg:gap-8">
            {nav.map((item) => {
              const Tag = linkFor(item.href);
              return (
                <li key={item.key}>
                  <Tag
                    href={item.href}
                    aria-current={item.active ? "page" : undefined}
                    className="group relative flex min-h-11 items-center text-sm text-plum"
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 bottom-[7px] h-px origin-left bg-plum transition-transform duration-[350ms] ease-out-soft group-hover:scale-x-100 rtl:origin-right ${
                        item.active ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </Tag>
                </li>
              );
            })}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher locale={locale} label={dict.a11y.language} />

            {/* Dark pill, mirroring the reference's shop button. */}
            <Link
              href={`${home}/products`}
              className="btn btn-dark hidden min-h-11 gap-2.5 px-4 py-2.5 text-[0.8125rem] md:inline-flex lg:min-h-12 lg:px-5"
            >
              {dict.nav.products}
              <ArrowUpLeft className="size-[17px] -scale-x-100 rtl:scale-x-100" />
            </Link>

            {/* Circular burger — the bars cross when the sheet is open. */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? dict.a11y.closeMenu : dict.a11y.openMenu}
              className="flex size-11 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-full border border-line-strong bg-transparent p-2.5 md:hidden"
            >
              <span
                aria-hidden="true"
                className={`h-px w-[19px] bg-plum transition-transform duration-300 ease-out-soft ${
                  open ? "translate-y-[3.5px] rotate-45" : ""
                }`}
              />
              <span
                aria-hidden="true"
                className={`h-px w-[19px] bg-plum transition-transform duration-300 ease-out-soft ${
                  open ? "-translate-y-[3.5px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </nav>

        {/* Mobile sheet */}
        <div
          id="mobile-nav"
          hidden={!open}
          className="absolute inset-x-0 top-full border-b border-line bg-ivory px-[6%] pt-4 pb-6 shadow-[0_18px_35px_rgb(73_44_64_/_0.07)] md:hidden"
        >
          <ul className="flex flex-col">
            {nav.map((item) => {
              const Tag = linkFor(item.href);
              return (
                <li key={item.key} className="border-b border-line/50 last:border-b-0">
                  <Tag
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block px-1 py-3.5 text-base text-plum"
                  >
                    {item.label}
                  </Tag>
                </li>
              );
            })}
          </ul>
        </div>
      </header>
    </>
  );
}
