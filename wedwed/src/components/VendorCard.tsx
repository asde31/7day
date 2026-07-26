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
    <article className="glass-card group flex flex-col overflow-hidden">
      <div className="relative m-1.5 aspect-[4/3] overflow-hidden rounded-[18px] bg-cream-deep">
        {vendor.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vendor.imageUrl}
            alt={vendor.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-4xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent-gold-light), var(--accent-gold))' }}
          >
            {initials(vendor.name) || '💍'}
          </div>
        )}
        {vendor.isFeatured && (
          <span
            className="glass-pill absolute left-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-semibold text-ink"
            style={{ color: 'var(--accent-gold-dk)' }}
          >
            ★ Рекомендуем
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-1">
        <h3 className="text-base font-semibold leading-tight text-ink">{vendor.name}</h3>
        {vendor.city && <p className="mt-1 text-sm text-muted">📍 {vendor.city}</p>}
        {vendor.description && <p className="mt-2 line-clamp-2 text-sm text-muted">{vendor.description}</p>}
        {price && <p className="mt-3 text-sm font-bold text-ink">{price}</p>}

        <div className="mt-3 flex flex-wrap gap-2 pt-1">
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="glass-pill inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-medium text-ink transition hover:brightness-105 active:scale-95"
            >
              {c.label}
            </a>
          ))}
          {contacts.length === 0 && <span className="text-xs text-muted">Контакты уточняются</span>}
        </div>
      </div>
    </article>
  );
}
