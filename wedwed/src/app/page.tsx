import Link from 'next/link';
import { getPublicCatalog } from '@/lib/api';
import type { PublicCategory } from '@/lib/types';
import TelegramInit from '@/components/TelegramInit';
import CategoryNav from '@/components/CategoryNav';
import VendorCard from '@/components/VendorCard';

// Рендерим на запрос, но тяжёлое чтение из БД закэшировано (unstable_cache,
// 60 c) и разделяется между всеми пользователями — это даёт запас по нагрузке.
export const dynamic = 'force-dynamic';

async function loadCatalog(): Promise<PublicCategory[]> {
  try {
    return (await getPublicCatalog()) as unknown as PublicCategory[];
  } catch (e) {
    // БД ещё не поднята/не заполнена — показываем пустое состояние, а не 500.
    console.error('[home] catalog unavailable:', e);
    return [];
  }
}

export default async function HomePage() {
  const catalog = await loadCatalog();
  const nonEmpty = catalog.filter((c) => c.vendors.length > 0);
  const totalVendors = catalog.reduce((s, c) => s + c.vendors.length, 0);

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl bg-champagne pb-16">
      <TelegramInit />

      {/* Шапка */}
      <header className="bg-gradient-to-b from-blush-600 to-blush-500 px-5 pb-6 pt-8 text-white safe-top">
        <p className="text-sm/relaxed opacity-80">Свадебный каталог</p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight">
          Подрядчики для вашей свадьбы 💍
        </h1>
        <p className="mt-2 max-w-md text-sm opacity-90">
          Проверенные исполнители по всем направлениям — выбирайте лучших и связывайтесь напрямую.
        </p>
        <div className="mt-4 flex gap-4 text-sm">
          <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">
            {nonEmpty.length} категорий
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">
            {totalVendors} подрядчиков
          </span>
        </div>
      </header>

      <CategoryNav
        items={nonEmpty.map((c) => ({ id: c.id, slug: c.slug, title: c.title, emoji: c.emoji }))}
      />

      {/* Блоки категорий */}
      <div className="space-y-8 px-3 pt-5">
        {nonEmpty.length === 0 && (
          <div className="rounded-xl2 bg-white p-8 text-center text-ink/60 shadow-card">
            <p className="text-4xl">🕊️</p>
            <p className="mt-3 font-display text-lg">Каталог скоро наполнится</p>
            <p className="mt-1 text-sm">Добавьте подрядчиков в админ-панели.</p>
          </div>
        )}

        {nonEmpty.map((cat) => (
          <section key={cat.id} id={`block-${cat.slug}`} data-slug={cat.slug} className="scroll-mt-20">
            <div className="mb-3 flex items-baseline justify-between px-1">
              <h2 className="font-display text-xl font-bold text-ink">
                <span aria-hidden className="mr-1.5">
                  {cat.emoji}
                </span>
                {cat.title}
              </h2>
              <span className="text-xs text-ink/40">{cat.vendors.length}</span>
            </div>
            {cat.subtitle && <p className="mb-2 px-1 text-sm text-ink/50">{cat.subtitle}</p>}

            <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
              {cat.vendors.map((v) => (
                <VendorCard key={v.id} vendor={v} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-10 px-5 text-center text-xs text-ink/40">
        <p>Свадебный каталог подрядчиков</p>
        <Link href="/admin" className="mt-1 inline-block text-blush-600 underline">
          Панель управления
        </Link>
      </footer>
    </main>
  );
}
