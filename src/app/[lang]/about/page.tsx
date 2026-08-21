import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CompanyGallery from "@/components/company-gallery";
import RevealObserver from "@/components/reveal-observer";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import TeamGrid from "@/components/team-grid";
import { Petals } from "@/components/icons";
import { getDictionary } from "@/i18n";
import { isLocale, locales } from "@/i18n/config";
import { getCompanyProfile } from "@/lib/company";
import { getVisibleGalleryItems } from "@/lib/gallery";
import { getVisibleTeamMembers } from "@/lib/team";
import { toGalleryItemViews, toProfileView, toTeamMemberViews } from "@/lib/view";

/* Everything on this page is dashboard-editable, so it is read per request
   rather than baked in at build time. */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.about.title, description: dict.about.subtitle };
}

/** Section heading with the brand petal flourish above it. */
function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="reveal mb-10 text-center md:mb-14">
      <Petals className="mx-auto size-6 text-accent" />
      <h2 className="mt-3 text-2xl font-bold text-brand-600 md:text-3xl">{title}</h2>
      {subtitle && (
        <p className="mx-auto mt-3 max-w-2xl text-[0.9375rem] text-ink-soft">
          {subtitle}
        </p>
      )}
    </header>
  );
}

/** Renders admin-entered prose: a blank line starts a new paragraph. */
function Prose({ text, className = "" }: { text: string; className?: string }) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className={`space-y-4 leading-relaxed text-ink-soft ${className}`}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);

  const [profileRecord, memberRecords, galleryRecords] = await Promise.all([
    getCompanyProfile(),
    getVisibleTeamMembers(),
    getVisibleGalleryItems(),
  ]);

  const profile = toProfileView(profileRecord, lang);
  const team = toTeamMemberViews(memberRecords, lang);
  const gallery = toGalleryItemViews(galleryRecords, lang);

  const nothingPublished = !profile.hasAny && !team.length && !gallery.length;

  return (
    <>
      <SiteHeader locale={lang} dict={dict} />

      <main className="flex-1">
        {/* ---------------------------- Hero ---------------------------- */}
        <section className="relative overflow-hidden border-b border-line bg-linear-to-b from-brand-50/70 to-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 end-[-6rem] size-72 rounded-full bg-accent/10 blur-3xl"
          />
          <div className="container-page relative py-16 text-center md:py-24">
            <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
              {dict.footer.companyName}
            </p>
            <h1 className="mt-4 text-3xl font-bold text-brand-600 md:text-[2.75rem]">
              {profile.headline || dict.about.title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-soft">
              {profile.intro || dict.about.subtitle}
            </p>
          </div>
        </section>

        {nothingPublished && (
          <section className="container-page py-20 md:py-28">
            <p className="rounded-card border border-dashed border-line bg-surface-2 py-16 text-center text-ink-soft">
              {dict.about.empty}
            </p>
          </section>
        )}

        {/* ------------------------ Key figures ------------------------- */}
        {profile.stats.length > 0 && (
          <section className="border-b border-line bg-white">
            <div className="container-page py-12 md:py-16">
              <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
                {/* Each cell is reversed so the figure reads above its label
                    while the markup keeps <dt> before <dd>. */}
                {profile.stats.map((stat, index) => (
                  <div
                    key={`${stat.label}-${index}`}
                    className="reveal flex flex-col-reverse text-center"
                    style={
                      { "--reveal-delay": `${index * 80}ms` } as React.CSSProperties
                    }
                  >
                    <dt className="mt-2 text-sm text-ink-soft">{stat.label}</dt>
                    <dd className="tabular text-3xl font-bold text-brand-600 md:text-4xl">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

        {/* --------------------------- Story ---------------------------- */}
        {profile.story && (
          <section className="container-page py-16 md:py-24">
            <div className="mx-auto max-w-3xl">
              <SectionHeading title={dict.about.story} />
              <div className="reveal">
                <Prose text={profile.story} className="text-[1.0625rem]" />
              </div>
            </div>
          </section>
        )}

        {/* --------------------- Mission and vision --------------------- */}
        {(profile.mission || profile.vision) && (
          <section className="border-y border-line bg-surface-2/60">
            <div className="container-page py-16 md:py-24">
              <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
                {[
                  { title: dict.about.mission, text: profile.mission },
                  { title: dict.about.vision, text: profile.vision },
                ]
                  .filter((card) => card.text)
                  .map((card, index) => (
                    <article
                      key={card.title}
                      className="reveal rounded-card border border-line bg-white p-7 shadow-soft md:p-9"
                      style={
                        {
                          "--reveal-delay": `${index * 100}ms`,
                        } as React.CSSProperties
                      }
                    >
                      <h2 className="text-xl font-bold text-brand-600">{card.title}</h2>
                      <span
                        aria-hidden="true"
                        className="mt-3 block h-0.5 w-10 rounded-full bg-accent"
                      />
                      <Prose text={card.text} className="mt-5 text-[0.9375rem]" />
                    </article>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* -------------------------- Values ---------------------------- */}
        {profile.values.length > 0 && (
          <section className="container-page py-16 md:py-24">
            <SectionHeading title={dict.about.values} />
            <ul className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {profile.values.map((value, index) => (
                <li
                  key={`${value.title}-${index}`}
                  className="reveal rounded-card border border-line bg-white p-6 transition-[border-color,box-shadow] duration-300 hover:border-brand-200 hover:shadow-lift"
                  style={
                    { "--reveal-delay": `${index * 70}ms` } as React.CSSProperties
                  }
                >
                  <span aria-hidden="true" className="tabular block text-sm font-semibold text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {value.title && (
                    <h3 className="mt-2 text-base font-bold text-ink">{value.title}</h3>
                  )}
                  {value.description && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {value.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* --------------------------- Team ----------------------------- */}
        {team.length > 0 && (
          <section className="border-y border-line bg-surface-2/60">
            <div className="container-page py-16 md:py-24">
              <SectionHeading title={dict.about.team} subtitle={dict.about.teamSubtitle} />
              <TeamGrid members={team} />
            </div>
          </section>
        )}

        {/* -------------------------- Gallery --------------------------- */}
        {gallery.length > 0 && (
          <section className="container-page py-16 md:py-24">
            <SectionHeading
              title={dict.about.gallery}
              subtitle={dict.about.gallerySubtitle}
            />
            <CompanyGallery items={gallery} />
          </section>
        )}
      </main>

      <SiteFooter dict={dict} locale={lang} />
      <RevealObserver />
    </>
  );
}
