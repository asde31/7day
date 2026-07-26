'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { PublicCategory } from '@/lib/types';
import { UZ_CITIES } from '@/lib/uz';
import VendorCard from './VendorCard';

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'capacity-desc';

export default function CatalogCategory({ category }: { category: PublicCategory }) {
  const [city, setCity] = useState('');
  const [query, setQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>('featured');

  // Все теги, встречающиеся у подрядчиков этого блока.
  const allTags = useMemo(() => {
    const set = new Set<string>();
    category.vendors.forEach((v) => v.tags.forEach((t) => set.add(t)));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [category.vendors]);

  const toggleTag = (t: string) =>
    setActiveTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const result = useMemo(() => {
    const q = query.trim().toLowerCase();
    const maxP = maxPrice ? Number(maxPrice) : null;
    const minC = minCapacity ? Number(minCapacity) : null;

    let list = category.vendors.filter((v) => {
      if (city && v.city !== city) return false;
      if (q && !`${v.name} ${v.description ?? ''} ${v.city ?? ''}`.toLowerCase().includes(q)) return false;
      if (maxP != null && v.priceFrom != null && v.priceFrom > maxP) return false;
      if (minC != null && (v.capacity == null || v.capacity < minC)) return false;
      if (activeTags.length && !activeTags.every((t) => v.tags.includes(t))) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return (a.priceFrom ?? Infinity) - (b.priceFrom ?? Infinity);
        case 'price-desc':
          return (b.priceFrom ?? -1) - (a.priceFrom ?? -1);
        case 'capacity-desc':
          return (b.capacity ?? -1) - (a.capacity ?? -1);
        default:
          return Number(b.isFeatured) - Number(a.isFeatured);
      }
    });
    return list;
  }, [category.vendors, city, query, maxPrice, minCapacity, activeTags, sort]);

  const reset = () => {
    setCity('');
    setQuery('');
    setMaxPrice('');
    setMinCapacity('');
    setActiveTags([]);
    setSort('featured');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6">
      {/* Хлебные крошки */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:underline">
          Главная
        </Link>
        <span>/</span>
        <span className="text-ink">{category.title}</span>
      </div>

      {/* Заголовок */}
      <div className="glass rounded-3xl px-6 py-7">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          <span className="mr-2">{category.emoji}</span>
          {category.title}
        </h1>
        {category.subtitle && <p className="mt-1 text-muted">{category.subtitle}</p>}
        <p className="mt-2 text-sm text-muted">
          Найдено: <b className="text-ink">{result.length}</b> из {category.vendors.length}
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* Фильтры */}
        <aside className="glass h-fit rounded-3xl p-5 lg:sticky lg:top-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-ink">Фильтры</h2>
            <button onClick={reset} className="text-xs hover:underline" style={{ color: 'var(--accent-emerald)' }}>
              Сбросить
            </button>
          </div>

          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-medium text-muted">Поиск</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Название или описание"
              className="w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm outline-none focus:border-white"
            />
          </label>

          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-medium text-muted">Город</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm outline-none focus:border-white"
            >
              <option value="">Все города</option>
              {UZ_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">Цена до, сум</span>
              <input
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value.replace(/[^\d]/g, ''))}
                inputMode="numeric"
                placeholder="—"
                className="w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm outline-none focus:border-white"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">Гостей от</span>
              <input
                value={minCapacity}
                onChange={(e) => setMinCapacity(e.target.value.replace(/[^\d]/g, ''))}
                inputMode="numeric"
                placeholder="—"
                className="w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm outline-none focus:border-white"
              />
            </label>
          </div>

          {allTags.length > 0 && (
            <div className="mb-1">
              <span className="mb-1.5 block text-xs font-medium text-muted">Удобства</span>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    className={`rounded-full px-2.5 py-1 text-xs transition ${
                      activeTags.includes(t)
                        ? 'text-white'
                        : 'bg-white/60 text-muted hover:bg-white'
                    }`}
                    style={activeTags.includes(t) ? { background: 'var(--accent-gold-dk)' } : undefined}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Результаты */}
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-sm text-muted">Показано: {result.length}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="glass-pill rounded-xl px-3 py-2 text-sm text-ink outline-none"
            >
              <option value="featured">Сначала рекомендуемые</option>
              <option value="price-asc">Дешевле</option>
              <option value="price-desc">Дороже</option>
              <option value="capacity-desc">Больше вместимость</option>
            </select>
          </div>

          {result.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center">
              <p className="text-3xl">🔍</p>
              <p className="mt-2 font-semibold text-ink">Ничего не найдено</p>
              <p className="mt-1 text-sm text-muted">Измените фильтры или сбросьте их.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {result.map((v) => (
                <VendorCard key={v.id} vendor={v} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
