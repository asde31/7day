import { getPublicCatalog } from '@/lib/api';
import type { PublicCategory } from '@/lib/types';
import TelegramInit from '@/components/TelegramInit';
import CatalogView from '@/components/CatalogView';

// Рендерим на запрос, тяжёлое чтение из БД закэшировано (unstable_cache, 60 c)
// и разделяется между всеми пользователями — запас по нагрузке.
export const dynamic = 'force-dynamic';

async function loadCatalog(): Promise<PublicCategory[]> {
  try {
    return (await getPublicCatalog()) as unknown as PublicCategory[];
  } catch (e) {
    console.error('[home] catalog unavailable:', e);
    return [];
  }
}

export default async function HomePage() {
  const catalog = await loadCatalog();
  return (
    <>
      <TelegramInit />
      <CatalogView catalog={catalog} />
    </>
  );
}
