import type { PublicVendor } from '@/lib/types';
import { formatPrice } from '@/lib/uz';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function VendorCard({ vendor }: { vendor: PublicVendor }) {
  const price = formatPrice(vendor.priceFrom);

  const contacts: { href: string; label: string }[] = [];
  if (vendor.phone) contacts.push({ href: `tel:${vendor.phone.replace(/\s/g, '')}`, label: 'Позвонить' });
  if (vendor.telegram)
    contacts.push({ href: `https://t.me/${vendor.telegram.replace(/^@/, '')}`, label: 'Telegram' });
  if (vendor.whatsapp)
    contacts.push({ href: `https://wa.me/${vendor.whatsapp.replace(/[^\d]/g, '')}`, label: 'WhatsApp' });
  if (vendor.instagram)
    contacts.push({ href: `https://instagram.com/${vendor.instagram.replace(/^@/, '')}`, label: 'Instagram' });
  if (vendor.website) contacts.push({ href: vendor.website, label: 'Сайт' });

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/70 transition hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        {vendor.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vendor.imageUrl}
            alt={vendor.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-100 to-neutral-100 text-4xl font-semibold text-rose-400">
            {initials(vendor.name) || '💍'}
          </div>
        )}
        {vendor.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
            ★ Рекомендуем
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold leading-tight text-neutral-900">{vendor.name}</h3>
        {vendor.city && <p className="mt-1 text-sm text-neutral-500">📍 {vendor.city}</p>}
        {vendor.description && (
          <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{vendor.description}</p>
        )}
        {price && <p className="mt-3 text-sm font-semibold text-neutral-900">{price}</p>}

        <div className="mt-3 flex flex-wrap gap-2 pt-1">
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-rose-500 hover:text-white active:scale-95"
            >
              {c.label}
            </a>
          ))}
          {contacts.length === 0 && <span className="text-xs text-neutral-400">Контакты уточняются</span>}
        </div>
      </div>
    </article>
  );
}
