import Image from "next/image";

import { Linkedin, Mail, Phone } from "@/components/icons";
import type { TeamMemberView } from "@/lib/view";

/** Initials stand in when no portrait has been uploaded. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function ContactLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      aria-label={label}
      title={label}
      className="flex size-9 items-center justify-center rounded-full border border-line text-ink-soft transition-[color,background-color,border-color] duration-200 hover:border-line-strong hover:bg-blush hover:text-plum"
    >
      {children}
    </a>
  );
}

export default function TeamGrid({ members }: { members: TeamMemberView[] }) {
  return (
    <ul className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member, index) => (
        <li
          key={member.id}
          className="reveal group flex flex-col overflow-hidden rounded-card border border-line bg-card shadow-soft transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-lift"
          style={{ "--reveal-delay": `${index * 80}ms` } as React.CSSProperties}
        >
          {/* Portrait — a fixed 4:5 plate so uneven uploads still line up. */}
          <div className="relative aspect-4/5 w-full overflow-hidden bg-surface-2">
            {member.photo ? (
              <Image
                src={member.photo}
                alt={member.name}
                fill
                sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-full items-center justify-center bg-linear-to-br from-brand-50 to-surface-2 font-serif text-4xl text-brand-300"
              >
                {initials(member.name)}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col p-6">
            <h3 className="text-xl text-ink">{member.name}</h3>
            {member.role && (
              <p className="mt-1 text-sm text-rose-ink">{member.role}</p>
            )}

            {member.bio && (
              <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-ink-soft">
                {member.bio}
              </p>
            )}

            {/* Optional admin-defined facts. */}
            {member.details.length > 0 && (
              <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
                {member.details.map((detail, detailIndex) => (
                  <div
                    key={`${detail.label}-${detailIndex}`}
                    className="flex gap-2"
                  >
                    {detail.label && (
                      <dt className="shrink-0 font-medium text-ink-faint">
                        {detail.label}
                      </dt>
                    )}
                    <dd className="min-w-0 text-ink-soft">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {(member.email || member.phone || member.linkedin) && (
              <div className="mt-auto flex items-center gap-2 pt-6">
                {member.email && (
                  <ContactLink href={`mailto:${member.email}`} label={member.email}>
                    <Mail className="size-4" />
                  </ContactLink>
                )}
                {member.phone && (
                  <ContactLink
                    href={`tel:${member.phone.replace(/\s/g, "")}`}
                    label={member.phone}
                  >
                    <Phone className="size-4" />
                  </ContactLink>
                )}
                {member.linkedin && (
                  <ContactLink href={member.linkedin} label="LinkedIn">
                    <Linkedin className="size-4" />
                  </ContactLink>
                )}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
