import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CompanyGallery from "@/components/company-gallery";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import TeamGrid from "@/components/team-grid";
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

/**
 * Section heading: eyebrow and serif title on the start side, the supporting
 * line pushed to the end side once there is room for both.
 */
function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="reveal mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between md:gap-11">
      <div>
        <p className="eyebrow mb-4 text-rose-ink">{eyebrow}</p>
        <h2 className="text-[clamp(2.2rem,4vw,3.65rem)]">{title}</h2>
      </div>
      {subtitle && <p className="max-w-[340px] text-ink-soft">{subtitle}</p>}
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
    <div className={`space-y-5 leading-[1.9] text-ink-soft ${className}`}>
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
        <section className="container-page pt-12 pb-10 md:pt-16 md:pb-14">
          <div className="grid gap-8 md:grid-cols-[1.05fr_1fr] md:items-end md:gap-12">
            <div>
              <p className="eyebrow mb-5 text-rose-ink">{dict.footer.companyName}</p>
              <h1 className="text-[clamp(2.75rem,5.4vw,5rem)] tracking-[-0.06em]">
                {profile.headline || dict.about.title}
              </h1>
            </div>
            <p className="max-w-[460px] leading-[1.9] text-ink-soft">
              {profile.intro || dict.about.subtitle}
            </p>
          </div>
        </section>

        {nothingPublished && (
          <section className="container-page section-space">
            <p className="rounded-card border border-dashed border-line bg-surface-2 py-16 text-center text-ink-soft">
              {dict.about.empty}
            </p>
          </section>
        )}

        {/* ------------------------ Key figures ------------------------- */}
        {profile.stats.length > 0 && (
          <section className="container-page">
            <dl className="grid grid-cols-2 gap-8 border-y border-line py-10 md:grid-cols-4 md:py-12">
              {/* Each cell is reversed so the figure reads above its label
                  while the markup keeps <dt> before <dd>. */}
              {profile.stats.map((stat, index) => (
                <div
                  key={`${stat.label}-${index}`}
                  className="reveal flex flex-col-reverse"
                  style={{ "--reveal-delay": `${index * 80}ms` } as React.CSSProperties}
                >
                  <dt className="mt-2 text-sm text-ink-soft">{stat.label}</dt>
                  <dd className="tabular font-serif text-[2.4rem] leading-none tracking-[-0.045em] md:text-[3rem]">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* --------------------------- Story ---------------------------- */}
        {profile.story && (
          <section className="container-page section-space">
            {/* Blush panel with the oversized wordmark bleeding off the end
                corner — the reference's story block. */}
            <div className="reveal relative overflow-hidden rounded-[24px] bg-[#f0e0e1] p-8 md:p-12 lg:p-16">
              <p className="eyebrow mb-4 text-rose-ink">{dict.footer.companyName}</p>
              <h2 className="mb-6 max-w-3xl text-[clamp(2.2rem,4vw,3.45rem)]">
                {dict.about.story}
              </h2>
              <Prose text={profile.story} className="relative z-1 max-w-3xl" />

              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-4 end-6 font-serif text-[120px] leading-none tracking-[-0.1em] text-[#dbc0c9] italic md:text-[155px]"
              >
                véa
              </span>
            </div>
          </section>
        )}

        {/* --------------------- Mission and vision --------------------- */}
        {(profile.mission || profile.vision) && (
          <section className="container-page pb-14 md:pb-20">
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { title: dict.about.mission, text: profile.mission },
                { title: dict.about.vision, text: profile.vision },
              ]
                .filter((card) => card.text)
                .map((card, index) => (
                  <article
                    key={card.title}
                    className="reveal rounded-card border border-line bg-card p-8 shadow-soft md:p-10"
                    style={
                      { "--reveal-delay": `${index * 100}ms` } as React.CSSProperties
                    }
                  >
                    <h2 className="text-[1.9rem]">{card.title}</h2>
                    <span
                      aria-hidden="true"
                      className="mt-4 block h-px w-10 bg-rose-ink"
                    />
                    <Prose text={card.text} className="mt-5 text-[0.9375rem]" />
                  </article>
                ))}
            </div>
          </section>
        )}

        {/* -------------------------- Values ---------------------------- */}
        {profile.values.length > 0 && (
          <section className="container-page section-space border-t border-line">
            <SectionHeading eyebrow={dict.about.title} title={dict.about.values} />
            {/* Numbered rows rather than boxes — the reference's "reasons". */}
            <ul className="grid gap-7 md:grid-cols-3 lg:gap-9">
              {profile.values.map((value, index) => (
                <li
                  key={`${value.title}-${index}`}
                  className="reveal flex items-start gap-4"
                  style={{ "--reveal-delay": `${index * 70}ms` } as React.CSSProperties}
                >
                  <span
                    aria-hidden="true"
                    className="tabular grid size-10 shrink-0 place-items-center rounded-full border border-line-strong text-xs text-rose-ink"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    {value.title && (
                      <h3 className="font-sans text-base font-medium tracking-normal">
                        {value.title}
                      </h3>
                    )}
                    {value.description && (
                      <p className="mt-2 text-sm leading-[1.75] text-ink-soft">
                        {value.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* --------------------------- Team ----------------------------- */}
        {team.length > 0 && (
          <section className="container-page section-space border-t border-line">
            <SectionHeading
              eyebrow={dict.about.team}
              title={dict.about.team}
              subtitle={dict.about.teamSubtitle}
            />
            <TeamGrid members={team} />
          </section>
        )}

        {/* -------------------------- Gallery --------------------------- */}
        {gallery.length > 0 && (
          <section className="container-page section-space border-t border-line">
            <SectionHeading
              eyebrow={dict.about.gallery}
              title={dict.about.gallery}
              subtitle={dict.about.gallerySubtitle}
            />
            <CompanyGallery items={gallery} />
          </section>
        )}
      </main>

      <SiteFooter dict={dict} locale={lang} />
    </>
  );
}
