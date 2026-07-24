import type { PublicVendor } from '@/lib/types';

function priceLabel(n: number | null): string | null {
  if (n == null) return null;
  return `от ${n.toLocaleString('ru-RU')} ₽`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function VendorCard({ vendor }: { vendor: PublicVendor }) {
  const price = priceLabel(vendor.priceFrom);

  const contacts: { href: string; label: string; icon: string }[] = [];
  if (vendor.phone) contacts.push({ href: `tel:${vendor.phone.replace(/\s/g, '')}`, label: 'Позвонить', icon: '📞' });
  if (vendor.telegram)
    contacts.push({
      href: `https://t.me/${vendor.telegram.replace(/^@/, '')}`,
      label: 'Telegram',
      icon: '✈️',
    });
  if (vendor.whatsapp)
    contacts.push({
      href: `https://wa.me/${vendor.whatsapp.replace(/[^\d]/g, '')}`,
      label: 'WhatsApp',
      icon: '🟢',
    });
  if (vendor.instagram)
    contacts.push({
      href: `https://instagram.com/${vendor.instagram.replace(/^@/, '')}`,
      label: 'Instagram',
      icon: '📸',
    });
  if (vendor.website) contacts.push({ href: vendor.website, label: 'Сайт', icon: '🌐' });

  return (
    <article className="flex min-w-[260px] max-w-[280px] snap-start flex-col overflow-hidden rounded-xl2 bg-white shadow-card ring-1 ring-black/5">
      <div className="relative h-36 w-full bg-blush-100">
        {vendor.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vendor.imageUrl}
            alt={vendor.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blush-200 to-blush-100 text-3xl font-display font-semibold text-blush-700">
            {initials(vendor.name) || '💍'}
          </div>
        )}
        {vendor.isFeatured && (
          <span className="absolute left-2 top-2 rounded-full bg-blush-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow">
            ⭐ Рекомендуем
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="font-display text-base font-semibold leading-tight text-ink">{vendor.name}</h3>
        {vendor.city && <p className="text-xs text-blush-700">📍 {vendor.city}</p>}
        {vendor.description && (
          <p className="mt-0.5 line-clamp-3 text-sm text-ink/70">{vendor.description}</p>
        )}
        <div className="mt-auto pt-2">
          {price && <p className="mb-2 text-sm font-semibold text-ink">{price}</p>}
          <div className="flex flex-wrap gap-1.5">
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1 rounded-full bg-blush-50 px-2.5 py-1 text-xs font-medium text-blush-700 ring-1 ring-blush-200 transition active:scale-95"
              >
                <span aria-hidden>{c.icon}</span>
                {c.label}
              </a>
            ))}
            {contacts.length === 0 && (
              <span className="text-xs text-ink/40">Контакты уточняются</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
