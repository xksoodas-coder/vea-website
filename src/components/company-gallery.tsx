import Image from "next/image";

import type { GalleryItemView } from "@/lib/view";

/**
 * Photo grid for the About page. Captions sit under the image rather than over
 * it so long descriptions stay readable and never fight the artwork.
 */
export default function CompanyGallery({ items }: { items: GalleryItemView[] }) {
  return (
    <ul className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <li
          key={item.id}
          className="reveal group overflow-hidden rounded-card border border-line bg-white shadow-soft transition-[border-color,box-shadow] duration-300 hover:border-brand-200 hover:shadow-lift"
          style={{ "--reveal-delay": `${index * 70}ms` } as React.CSSProperties}
        >
          <figure>
            <div className="relative aspect-4/3 w-full overflow-hidden bg-surface-2">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>

            {(item.title || item.description) && (
              <figcaption className="p-5">
                {item.title && (
                  <h3 className="text-base font-bold text-ink">{item.title}</h3>
                )}
                {item.description && (
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink-soft">
                    {item.description}
                  </p>
                )}
              </figcaption>
            )}
          </figure>
        </li>
      ))}
    </ul>
  );
}
