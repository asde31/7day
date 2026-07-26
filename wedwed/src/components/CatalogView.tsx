'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { PublicCategory } from '@/lib/types';
import { REGION_NAME, UZ_CITIES } from '@/lib/uz';
import VendorCard from './VendorCard';

const STEPS = [
  { icon: '🗂️', title: 'Выберите категорию', text: 'Площадки, ведущие, фотографы, декор и другое.' },
  { icon: '🔍', title: 'Сравните подрядчиков', text: 'Фото, цены и город — всё на одной карточке.' },
  { icon: '💬', title: 'Свяжитесь напрямую', text: 'Звонок, Telegram или WhatsApp — без посредников.' },
];

export default function CatalogView({ catalog }: { catalog: PublicCategory[] }) {
  const [city, setCity] = useState<string>('');

  const filtered = useMemo(() => {
    if (!city) return catalog;
    return catalog
      .map((c) => ({ ...c, vendors: c.vendors.filter((v) => v.city === city) }))
      .filter((c) => c.vendors.length > 0);
  }, [catalog, city]);

  const withVendors = filtered.filter((c) => c.vendors.length > 0);
  const totalVendors = catalog.reduce((s, c) => s + c.vendors.length, 0);
  const citiesUsed = new Set(catalog.flatMap((c) => c.vendors.map((v) => v.city).filter(Boolean))).size;

  const scrollTo = (slug: string) => {
    const el = document.getElementById(`block-${slug}`);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  };
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Живой фон под стеклом */}
      <div className="aurora" aria-hidden>
        <span className="b1" />
        <span className="b2" />
        <span className="b3" />
      </div>

      {/* ── Стеклянный навбар ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 safe-top">
        <div className="glass mx-auto mt-2 flex max-w-6xl items-center gap-3 rounded-2xl px-4 py-2.5 sm:mt-3">
          <button onClick={() => scrollToId('top')} className="flex items-center gap-2">
            <span className="wax-seal grid h-9 w-9 place-items-center text-sm font-bold text-white">U</span>
            <span className="text-lg font-extrabold tracking-tight text-ink">Uzlav</span>
          </button>
          <span className="hidden items-center gap-1 text-sm text-muted sm:flex">
            <span style={{ color: 'var(--accent-gold-dk)' }}>📍</span> {REGION_NAME}
          </span>

          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {catalog.slice(0, 5).map((c) => (
              <button
                key={c.id}
                onClick={() => scrollTo(c.slug)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-white/50 hover:text-ink"
              >
                {c.title}
              </button>
            ))}
          </nav>

          <div className="ml-auto lg:ml-0">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="glass-pill rounded-xl px-3 py-2 text-sm text-ink outline-none"
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

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section id="top" className="mx-auto max-w-6xl px-4 pt-8 sm:pt-12">
        <div className="glass relative overflow-hidden rounded-3xl px-6 py-10 sm:px-12 sm:py-14">
          <div className="mx-auto mb-6 h-20 w-20 wax-seal grid place-items-center text-3xl">💍</div>
          <h1 className="mx-auto max-w-2xl text-center text-3xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            Свадебные подрядчики Узбекистана в одном месте
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-muted sm:text-base">
            Площадки, ведущие, фотографы, декор и другие специалисты — с фото, ценами и прямыми
            контактами.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => scrollToId('categories')}
              className="rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, var(--accent-gold-dk), var(--accent-btn-deep))' }}
            >
              Смотреть каталог
            </button>
            <button
              onClick={() => scrollToId('how')}
              className="glass-pill rounded-2xl px-6 py-3 text-sm font-semibold text-ink transition hover:brightness-105 active:scale-95"
            >
              Как это работает
            </button>
          </div>
        </div>
      </section>

      {/* ── Плитки категорий ──────────────────────────────────────── */}
      <section id="categories" className="mx-auto max-w-6xl px-4 pt-10">
        <h2 className="mb-4 text-xl font-bold tracking-tight text-ink">Категории</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {catalog.map((c) => (
            <Link
              key={c.id}
              href={`/catalog/${c.slug}`}
              className="glass-card flex aspect-[4/5] flex-col items-start justify-end p-4 text-left"
            >
              <span className="mb-auto text-3xl">{c.emoji}</span>
              <span className="text-base font-semibold text-ink">{c.title}</span>
              {c.subtitle && <span className="mt-0.5 text-xs text-muted">{c.subtitle}</span>}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Как это работает ──────────────────────────────────────── */}
      <section id="how" className="mx-auto max-w-6xl px-4 pt-14">
        <h2 className="mb-5 text-xl font-bold tracking-tight text-ink">Как это работает</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={i} className="glass rounded-3xl p-6">
              <div className="wax-seal mb-4 grid h-12 w-12 place-items-center text-xl">{s.icon}</div>
              <p className="text-xs font-semibold" style={{ color: 'var(--accent-gold-dk)' }}>
                Шаг {i + 1}
              </p>
              <h3 className="mt-1 text-base font-bold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Счётчики ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <div className="glass grid grid-cols-3 gap-2 rounded-3xl px-4 py-6 text-center">
          {[
            { n: catalog.length, l: 'категорий' },
            { n: totalVendors, l: 'подрядчиков' },
            { n: citiesUsed || UZ_CITIES.length, l: 'городов' },
          ].map((x) => (
            <div key={x.l}>
              <p className="text-3xl font-extrabold text-ink sm:text-4xl" style={{ color: 'var(--accent-gold-dk)' }}>
                {x.n}
              </p>
              <p className="text-xs text-muted sm:text-sm">{x.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Разделы с подрядчиками ────────────────────────────────── */}
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-14">
        {withVendors.length === 0 && (
          <div className="glass rounded-3xl p-10 text-center">
            <p className="text-4xl">🕊️</p>
            <p className="mt-3 text-lg font-semibold text-ink">
              {city ? `В городе ${city} пока нет подрядчиков` : 'Каталог скоро наполнится'}
            </p>
            <p className="mt-1 text-sm text-muted">
              {city ? 'Выберите «Все города» или загляните позже.' : 'Добавьте подрядчиков в панели управления.'}
            </p>
          </div>
        )}

        {withVendors.map((cat) => (
          <section key={cat.id} id={`block-${cat.slug}`} className="scroll-mt-28">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-ink">
                <span className="mr-2">{cat.emoji}</span>
                {cat.title}
              </h2>
              <span className="text-sm text-muted">{cat.vendors.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {cat.vendors.map((v) => (
                <VendorCard key={v.id} vendor={v} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ── Финальный CTA ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="glass relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:py-16">
          <div className="mx-auto mb-5 h-16 w-16 wax-seal grid place-items-center text-2xl">✨</div>
          <h2 className="mx-auto max-w-xl text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Готовите свадьбу? Начните с проверенных подрядчиков
          </h2>
          <button
            onClick={() => scrollToId('categories')}
            className="mt-6 rounded-2xl px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dk))' }}
          >
            Открыть каталог
          </button>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-center text-sm text-muted">
        <p className="font-semibold text-ink">Uzlav · {REGION_NAME}</p>
        <p className="mt-1">Свадебный каталог подрядчиков</p>
        <a href="/admin" className="mt-1 inline-block hover:underline" style={{ color: 'var(--accent-emerald)' }}>
          Панель управления
        </a>
      </footer>
    </div>
  );
}
