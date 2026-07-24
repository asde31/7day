'use client';

import { useEffect, useState } from 'react';

interface NavItem {
  id: string;
  slug: string;
  title: string;
  emoji: string;
}

// Липкая горизонтальная лента-«чипсы» категорий. Скроллит к блоку и
// подсвечивает активный блок через IntersectionObserver.
export default function CategoryNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState(items[0]?.slug ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.slug ?? '');
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    items.forEach((it) => {
      const el = document.getElementById(`block-${it.slug}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  const go = (slug: string) => {
    const el = document.getElementById(`block-${slug}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <nav className="no-scrollbar sticky top-0 z-20 flex gap-2 overflow-x-auto border-b border-blush-100 bg-champagne/95 px-3 py-2.5 backdrop-blur safe-top">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => go(it.slug)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            active === it.slug
              ? 'bg-blush-600 text-white shadow'
              : 'bg-white text-ink/70 ring-1 ring-blush-100'
          }`}
        >
          <span aria-hidden>{it.emoji}</span>
          {it.title}
        </button>
      ))}
    </nav>
  );
}
