'use client';

import { useMemo, useState } from 'react';
import type { PublicCategory } from '@/lib/types';
import { REGION_NAME, UZ_CITIES, tileGradient } from '@/lib/uz';
import VendorCard from './VendorCard';

export default function CatalogView({ catalog }: { catalog: PublicCategory[] }) {
  const [city, setCity] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);

  // Фильтрация по выбранному городу.
  const filtered = useMemo(() => {
    if (!city) return catalog;
    return catalog
      .map((c) => ({ ...c, vendors: c.vendors.filter((v) => v.city === city) }))
      .filter((c) => c.vendors.length > 0);
  }, [catalog, city]);

  const withVendors = filtered.filter((c) => c.vendors.length > 0);
  const totalVendors = catalog.reduce((s, c) => s + c.vendors.length, 0);

  const scrollTo = (slug: string) => {
    setMenuOpen(false);
    const el = document.getElementById(`block-${slug}`);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* ── Верхнее меню ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur safe-top">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <button onClick={() => scrollTo(catalog[0]?.slug ?? '')} className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-rose-500 text-white">💍</span>
            <span className="text-lg font-bold tracking-tight">Toy<span className="text-rose-500">Bazar</span></span>
          </button>

          <span className="hidden items-center gap-1 text-sm text-neutral-500 sm:flex">
            <span className="text-rose-500">📍</span> {REGION_NAME}
          </span>

          {/* Навигация (десктоп) */}
          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {catalog.slice(0, 6).map((c) => (
              <button
                key={c.id}
                onClick={() => scrollTo(c.slug)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                {c.title}
              </button>
            ))}
          </nav>

          {/* Выбор города */}
          <div className="ml-auto lg:ml-0">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400"
              aria-label="Город"
            >
              <option value="">Все города</option>
              {UZ_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-6 sm:pt-14">
        <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr] sm:items-end">
          <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Свадебные подрядчики Узбекистана в одном месте
          </h1>
          <p className="text-sm leading-relaxed text-neutral-500 sm:text-base">
            Площадки, ведущие, фотографы, декор и другие специалисты — с фото, ценами и прямыми
            контактами. {catalog.length} категорий · {totalVendors} подрядчиков.
          </p>
        </div>
      </section>

      {/* ── Сетка категорий (плитки) ─────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {catalog.map((c, i) => (
            <button
              key={c.id}
              onClick={() => scrollTo(c.slug)}
              className={`relative flex aspect-[4/5] items-end overflow-hidden rounded-2xl bg-gradient-to-br ${tileGradient(
                i
              )} p-4 text-left shadow-sm ring-1 ring-black/5 transition hover:shadow-lg`}
            >
              <span className="absolute right-3 top-3 text-3xl opacity-80">{c.emoji}</span>
              <span className="relative z-10">
                <span className="block rounded-lg bg-white/85 px-3 py-1.5 text-sm font-semibold text-neutral-900 backdrop-blur">
                  {c.title}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Разделы с подрядчиками ───────────────────────────────── */}
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        {withVendors.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-neutral-200">
            <p className="text-4xl">🕊️</p>
            <p className="mt-3 text-lg font-semibold">
              {city ? `В городе ${city} пока нет подрядчиков` : 'Каталог скоро наполнится'}
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              {city ? 'Выберите «Все города» или загляните позже.' : 'Добавьте подрядчиков в панели управления.'}
            </p>
          </div>
        )}

        {withVendors.map((cat) => (
          <section key={cat.id} id={`block-${cat.slug}`} className="scroll-mt-24">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-2xl font-bold tracking-tight">
                <span className="mr-2">{cat.emoji}</span>
                {cat.title}
              </h2>
              <span className="text-sm text-neutral-400">{cat.vendors.length}</span>
            </div>
            {cat.subtitle && <p className="-mt-3 mb-4 text-sm text-neutral-500">{cat.subtitle}</p>}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {cat.vendors.map((v) => (
                <VendorCard key={v.id} vendor={v} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ── Подвал ───────────────────────────────────────────────── */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-neutral-500">
          <p className="font-semibold text-neutral-700">Свадебный каталог · {REGION_NAME}</p>
          <p>Проверенные подрядчики для вашей свадьбы</p>
          <a href="/admin" className="mt-1 text-rose-500 hover:underline">
            Панель управления
          </a>
        </div>
      </footer>
    </div>
  );
}
