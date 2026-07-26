import Link from 'next/link';
import { getPublicCatalog } from '@/lib/api';
import type { PublicCategory } from '@/lib/types';
import TelegramInit from '@/components/TelegramInit';
import CatalogCategory from '@/components/CatalogCategory';

export const dynamic = 'force-dynamic';

async function loadCatalog(): Promise<PublicCategory[]> {
  try {
    return (await getPublicCatalog()) as unknown as PublicCategory[];
  } catch (e) {
    console.error('[catalog] unavailable:', e);
    return [];
  }
}

export default async function CatalogPage({ params }: { params: { slug: string } }) {
  const catalog = await loadCatalog();
  const category = catalog.find((c) => c.slug === params.slug) ?? null;

  return (
    <>
      <TelegramInit />
      <div className="aurora" aria-hidden>
        <span className="b1" />
        <span className="b2" />
        <span className="b3" />
      </div>
      {category ? (
        <CatalogCategory category={category} />
      ) : (
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <p className="text-4xl">🕊️</p>
          <p className="mt-3 text-lg font-semibold text-ink">Раздел не найден или пока пуст</p>
          <Link href="/" className="mt-4 inline-block text-sm" style={{ color: 'var(--accent-emerald)' }}>
            ← На главную
          </Link>
        </div>
      )}
    </>
  );
}
