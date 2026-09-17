import Image from "next/image";
import Link from "next/link";

import { ArrowUpLeft, Clock, Mail, MapPin, Phone, iconByName } from "@/components/icons";
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

/** Contact row: circled icon beside the value — the disc fills on hover. */
function ContactRow({
  icon: Icon,
  children,
  href,
}: {
  icon: typeof Phone;
  children: React.ReactNode;
  href?: string;
}) {
  const Tag = href ? "a" : "div";

  return (
    <Tag
      {...(href ? { href } : {})}
      className="group flex min-h-[50px] items-center gap-3.5"
    >
      <span className="icon-circle border-[#d7c7ce] group-hover:bg-blush">
        <Icon className="size-[19px]" />
      </span>
      <span className="min-w-0 text-[0.9375rem] leading-snug break-words">
        {children}
      </span>
    </Tag>
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
    <>
      {/* ==================== Contact + location ==================== */}
      <section id="contact" className="container-page section-space">
        <div className="grid gap-9 lg:grid-cols-[1fr_1.1fr] lg:gap-[7%]">
          {/* -------- Reach us -------- */}
          <div className="reveal">
            <p className="eyebrow mb-4 text-rose-ink">{dict.footer.contact}</p>
            <h2 className="mb-6 text-[clamp(2.2rem,4vw,3.4rem)]">
              {dict.footer.companyName}
            </h2>
            <p className="mb-6 max-w-[420px] text-ink-soft">{dict.meta.description}</p>

            <div className="max-w-[420px] space-y-5">
              {site.contact.phones.map((phone) => (
                <ContactRow
                  key={phone}
                  icon={Phone}
                  href={`tel:${phone.replace(/\s/g, "")}`}
                >
                  <Ltr>{phone}</Ltr>
                </ContactRow>
              ))}

              {site.contact.emails.map((email) => (
                <ContactRow key={email} icon={Mail} href={`mailto:${email}`}>
                  <Ltr>{email}</Ltr>
                </ContactRow>
              ))}

              <ContactRow icon={Clock}>{dict.footer.hours}</ContactRow>
            </div>
          </div>

          {/* -------- Sage location panel -------- */}
          <div
            className="reveal grid overflow-hidden rounded-[22px] border border-[#dae1d1] bg-[#e7edde] md:grid-cols-[0.9fr_1.1fr]"
            style={{ "--reveal-delay": "100ms" } as React.CSSProperties}
          >
            <div className="p-7 md:p-8 lg:p-10">
              <p className="eyebrow mb-4 text-[#5c6b51]">{dict.footer.location}</p>
              <h2 className="text-[clamp(1.9rem,3vw,2.6rem)] text-[#2f3a29]">
                {dict.footer.address}
              </h2>

              <p className="mt-5 flex items-start gap-2.5 text-sm leading-relaxed text-[#626c5a]">
                <MapPin className="mt-0.5 size-[18px] shrink-0" />
                <span>{dict.footer.hours}</span>
              </p>

              <a
                href={site.map.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline mt-6 min-h-12 gap-3.5 border-[#a8b39d] px-[18px] py-3 text-[#2f3a29] hover:bg-[#d5dec9]"
              >
                {dict.map.open}
                <ArrowUpLeft className="size-[18px] -scale-x-100 rtl:scale-x-100" />
              </a>
            </div>

            <div className="relative min-h-[300px] bg-[#dddcd4] md:min-h-[430px]">
              <MapPanel dict={dict} locale={locale} />
            </div>
          </div>
        </div>
      </section>

      {/* ========================= Plum footer ========================= */}
      <footer className="bg-plum pt-11 text-ivory md:pt-14">
        <div className="container-page">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 pb-9 md:grid-cols-[1.3fr_1fr_1.1fr_46px] md:gap-7 md:pb-12 lg:grid-cols-[1.7fr_1fr_1.3fr_46px] lg:gap-10">
            {/* -------- Brand -------- */}
            <div className="col-span-2 md:col-span-1">
              <Image
                src={site.logo.srcLight}
                alt={site.logo.alt}
                width={site.logo.width}
                height={site.logo.height}
                className="h-16 w-auto md:h-[4.5rem]"
              />
              <p className="mt-6 max-w-sm text-sm text-[#dfcbd5]">
                {dict.meta.description}
              </p>
            </div>

            {/* -------- Quick links -------- */}
            <nav aria-labelledby="footer-nav-heading">
              <h2
                id="footer-nav-heading"
                className="mb-4 font-sans text-sm font-semibold tracking-normal text-ivory md:text-base"
              >
                {dict.footer.quickLinks}
              </h2>
              <ul className="flex flex-col gap-2 text-sm text-[#dfcbd5]">
                {nav.map((item) => {
                  const Tag = item.href.startsWith("#") ? "a" : Link;
                  return (
                    <li key={item.href}>
                      <Tag
                        href={item.href}
                        className="flex min-h-10 items-center transition-colors duration-200 hover:text-ivory hover:underline hover:underline-offset-4"
                      >
                        {item.label}
                      </Tag>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* -------- Contact -------- */}
            <div>
              <h2 className="mb-4 font-sans text-sm font-semibold tracking-normal text-ivory md:text-base">
                {dict.footer.contact}
              </h2>
              <ul className="flex flex-col gap-2 text-sm text-[#dfcbd5]">
                {site.contact.phones.map((phone) => (
                  <li key={phone}>
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="flex min-h-10 items-center transition-colors duration-200 hover:text-ivory hover:underline hover:underline-offset-4"
                    >
                      <Ltr>{phone}</Ltr>
                    </a>
                  </li>
                ))}
                {site.contact.emails.map((email) => (
                  <li key={email}>
                    <a
                      href={`mailto:${email}`}
                      className="flex min-h-10 items-center break-all transition-colors duration-200 hover:text-ivory hover:underline hover:underline-offset-4"
                    >
                      <Ltr>{email}</Ltr>
                    </a>
                  </li>
                ))}
                <li className="flex min-h-10 items-center">{dict.footer.address}</li>
              </ul>
            </div>

            {/* -------- Back to top -------- */}
            <a
              href="#top"
              aria-label={dict.nav.home}
              className="col-span-2 grid size-[46px] place-items-center rounded-full border border-[#927387] text-xl transition-[background-color,transform] duration-300 hover:-translate-y-[3px] hover:bg-[#67465b] md:col-span-1"
            >
              <ArrowUpLeft className="size-5 rotate-45 rtl:-scale-x-100" />
            </a>
          </div>
        </div>

        {/* -------- Bottom bar -------- */}
        <div className="border-t border-[#715468]">
          <div className="container-page flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-[#dfcbd5]">
            <p>
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
                      className="flex size-11 items-center justify-center rounded-full border border-[#715468] text-[#dfcbd5] transition-[color,background-color,border-color] duration-300 hover:border-[#927387] hover:bg-[#67465b] hover:text-ivory"
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
    </>
  );
}
