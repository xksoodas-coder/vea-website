import Image from "next/image";
import Link from "next/link";

import { Clock, Mail, MapPin, Phone, iconByName } from "@/components/icons";
import MapPanel from "@/components/map-panel";
import { site } from "@/data/site";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

/** Digits and Latin addresses stay LTR inside an RTL paragraph. */
function Ltr({ children }: { children: React.ReactNode }) {
  return (
    <span dir="ltr" className="tabular inline-block">
      {children}
    </span>
  );
}

export default function SiteFooter({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const year = new Date().getFullYear();

  /* Real routes stay real links; only the in-page anchors use `<a>`. */
  const nav = [
    { label: dict.nav.home, href: `/${locale}` },
    { label: dict.nav.products, href: `/${locale}/products` },
    { label: dict.nav.about, href: `/${locale}/about` },
    { label: dict.nav.contact, href: "#contact" },
  ];

  return (
    <footer id="contact" className="bg-brand-900 text-white/80">
      {/* Thin brand rule at the top edge. */}
      <div
        aria-hidden="true"
        className="h-px bg-linear-to-l from-transparent via-brand-400/60 to-transparent"
      />

      <div className="container-page py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* -------- Company + links + contact -------- */}
          <div className="reveal lg:col-span-7">
            <Image
              src={site.logo.srcLight}
              alt={site.logo.alt}
              width={site.logo.width}
              height={site.logo.height}
              className="h-14 w-auto"
            />

            <h2 className="mt-5 text-lg font-bold text-white">
              {dict.footer.companyName}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65">
              {dict.meta.description}
            </p>

            <div className="mt-10 grid gap-10 sm:grid-cols-2">
              {/* Quick links */}
              <nav aria-labelledby="footer-nav-heading">
                <h3
                  id="footer-nav-heading"
                  className="text-xs font-semibold tracking-[0.16em] text-brand-300 uppercase"
                >
                  {dict.footer.quickLinks}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {nav.map((item) => {
                    const Tag = item.href.startsWith("#") ? "a" : Link;
                    return (
                      <li key={item.href}>
                        <Tag
                          href={item.href}
                          className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
                        >
                          {item.label}
                        </Tag>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Contact */}
              <div>
                <h3 className="text-xs font-semibold tracking-[0.16em] text-brand-300 uppercase">
                  {dict.footer.contact}
                </h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {site.contact.phones.map((phone) => (
                    <li key={phone} className="flex items-center gap-2.5">
                      <Phone className="size-4 shrink-0 text-brand-300" />
                      <a
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="text-white/70 transition-colors duration-200 hover:text-white"
                      >
                        <Ltr>{phone}</Ltr>
                      </a>
                    </li>
                  ))}

                  {site.contact.emails.map((email) => (
                    <li key={email} className="flex items-center gap-2.5">
                      <Mail className="size-4 shrink-0 text-brand-300" />
                      <a
                        href={`mailto:${email}`}
                        className="break-all text-white/70 transition-colors duration-200 hover:text-white"
                      >
                        <Ltr>{email}</Ltr>
                      </a>
                    </li>
                  ))}

                  <li className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-brand-300" />
                    <span className="text-white/70">{dict.footer.address}</span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <Clock className="mt-0.5 size-4 shrink-0 text-brand-300" />
                    <span className="text-white/70">{dict.footer.hours}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* -------- Live map -------- */}
          <div
            className="reveal lg:col-span-5"
            style={{ "--reveal-delay": "100ms" } as React.CSSProperties}
          >
            <h3 className="mb-4 text-xs font-semibold tracking-[0.16em] text-brand-300 uppercase">
              {dict.footer.location}
            </h3>
            <MapPanel dict={dict} locale={locale} />
          </div>
        </div>
      </div>

      {/* -------- Bottom bar -------- */}
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-5 py-6 sm:flex-row">
          <p className="text-xs text-white/45">
            © <span className="tabular">{year}</span> {dict.footer.companyName} —{" "}
            {dict.footer.rights}
          </p>

          <ul className="flex items-center gap-2">
            {site.social.map((item) => {
              const Icon = iconByName[item.icon];
              return (
                <li key={item.icon}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="flex size-11 items-center justify-center rounded-full border border-white/12 text-white/65 transition-[color,background-color,border-color] duration-200 hover:border-brand-300/70 hover:bg-white/8 hover:text-white"
                  >
                    <Icon className="size-[1.125rem]" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </footer>
  );
}
