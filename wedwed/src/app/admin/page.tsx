'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/client';
import type { AdminCategory, AdminVendor } from '@/lib/types';
import { UZ_CITIES, PHONE_PLACEHOLDER, formatPrice } from '@/lib/uz';

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    api<{ authenticated: boolean }>('/api/admin/session')
      .then((d) => setAuthed(d.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return <Centered>Загрузка…</Centered>;
  }
  return authed ? <Dashboard onLogout={() => setAuthed(false)} /> : <Login onLogin={() => setAuthed(true)} />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-champagne text-ink/60">{children}</div>
  );
}

/* ─────────────────────────── Логин ─────────────────────────── */
function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await api('/api/admin/login', { method: 'POST', body: { username, password } });
      onLogin();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-champagne p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl2 bg-white p-6 shadow-card">
        <h1 className="font-display text-2xl font-bold text-ink">Панель управления</h1>
        <p className="mb-5 mt-1 text-sm text-ink/50">Вход для администратора</p>
        <label className="mb-1 block text-sm font-medium text-ink/70">Логин</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          className="mb-3 w-full rounded-lg border border-blush-200 px-3 py-2 outline-none focus:border-blush-500"
        />
        <label className="mb-1 block text-sm font-medium text-ink/70">Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mb-4 w-full rounded-lg border border-blush-200 px-3 py-2 outline-none focus:border-blush-500"
        />
        {err && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-blush-600 py-2.5 font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? 'Входим…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}

/* ─────────────────────────── Дашборд ─────────────────────────── */
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const cats = await api<AdminCategory[]>('/api/admin/categories');
      setCategories(cats);
      setSelected((cur) => cur ?? cats[0]?.id ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const logout = async () => {
    await api('/api/admin/logout', { method: 'POST' }).catch(() => {});
    onLogout();
  };

  const moveCategory = async (id: string, dir: 'up' | 'top') => {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const arr = [...categories];
    const [item] = arr.splice(idx, 1);
    arr.splice(dir === 'top' ? 0 : Math.max(0, idx - 1), 0, item);
    setCategories(arr);
    await api('/api/admin/categories/reorder', { method: 'POST', body: { ids: arr.map((c) => c.id) } }).catch(load);
  };

  if (loading) return <Centered>Загрузка…</Centered>;

  const selectedCat = categories.find((c) => c.id === selected) ?? null;

  return (
    <div className="mx-auto min-h-screen max-w-5xl bg-champagne p-4">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Управление каталогом</h1>
        <div className="flex gap-2">
          <a href="/" target="_blank" className="rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-blush-200">
            Открыть сайт ↗
          </a>
          <button onClick={logout} className="rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-blush-200">
            Выйти
          </button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        {/* Колонка блоков */}
        <div className="rounded-xl2 bg-white p-3 shadow-card">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="font-semibold text-ink">Блоки сайта</h2>
          </div>
          <AddCategory onCreated={load} />
          <ul className="mt-3 space-y-1.5">
            {categories.map((c, i) => (
              <li
                key={c.id}
                className={`rounded-lg border p-2 ${
                  selected === c.id ? 'border-blush-400 bg-blush-50' : 'border-blush-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelected(c.id)} className="flex-1 text-left">
                    <span className="mr-1">{c.emoji}</span>
                    <span className={`font-medium ${c.isActive ? 'text-ink' : 'text-ink/40 line-through'}`}>
                      {c.title}
                    </span>
                    <span className="ml-1 text-xs text-ink/40">({c._count.vendors})</span>
                  </button>
                  <div className="flex gap-1">
                    <IconBtn title="Наверх" disabled={i === 0} onClick={() => moveCategory(c.id, 'top')}>
                      ⤒
                    </IconBtn>
                    <IconBtn title="Выше" disabled={i === 0} onClick={() => moveCategory(c.id, 'up')}>
                      ↑
                    </IconBtn>
                  </div>
                </div>
                <CategoryTools cat={c} onChanged={load} />
              </li>
            ))}
          </ul>
        </div>

        {/* Подрядчики выбранного блока */}
        <div className="rounded-xl2 bg-white p-3 shadow-card">
          {selectedCat ? (
            <VendorManager key={selectedCat.id} category={selectedCat} onCountChanged={load} />
          ) : (
            <p className="p-6 text-center text-ink/50">Выберите блок слева</p>
          )}
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-7 w-7 place-items-center rounded-md text-sm ring-1 transition active:scale-90 disabled:opacity-30 ${
        danger ? 'text-red-600 ring-red-200 hover:bg-red-50' : 'text-ink/70 ring-blush-200 hover:bg-blush-50'
      }`}
    >
      {children}
    </button>
  );
}

/* ─────────────── Создание / инструменты блока ─────────────── */
function AddCategory({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await api('/api/admin/categories', { method: 'POST', body: { title, emoji, subtitle } });
      setTitle('');
      setEmoji('');
      setSubtitle('');
      setOpen(false);
      onCreated();
    } finally {
      setBusy(false);
    }
  };

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-dashed border-blush-300 py-2 text-sm font-medium text-blush-700 hover:bg-blush-50"
      >
        + Добавить блок
      </button>
    );

  return (
    <div className="rounded-lg bg-blush-50 p-2">
      <div className="flex gap-2">
        <input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="💍"
          className="w-12 rounded border border-blush-200 px-2 py-1.5 text-center"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название блока"
          className="flex-1 rounded border border-blush-200 px-2 py-1.5"
        />
      </div>
      <input
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        placeholder="Подзаголовок (необязательно)"
        className="mt-2 w-full rounded border border-blush-200 px-2 py-1.5 text-sm"
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={create}
          disabled={busy}
          className="flex-1 rounded bg-blush-600 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          Создать
        </button>
        <button onClick={() => setOpen(false)} className="rounded px-3 py-1.5 text-sm text-ink/60">
          Отмена
        </button>
      </div>
    </div>
  );
}

function CategoryTools({ cat, onChanged }: { cat: AdminCategory; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(cat.title);
  const [emoji, setEmoji] = useState(cat.emoji);
  const [subtitle, setSubtitle] = useState(cat.subtitle ?? '');

  const save = async () => {
    await api(`/api/admin/categories/${cat.id}`, { method: 'PATCH', body: { title, emoji, subtitle } });
    setEditing(false);
    onChanged();
  };
  const toggle = async () => {
    await api(`/api/admin/categories/${cat.id}`, { method: 'PATCH', body: { isActive: !cat.isActive } });
    onChanged();
  };
  const remove = async () => {
    if (!confirm(`Удалить блок «${cat.title}» и всех подрядчиков в нём?`)) return;
    await api(`/api/admin/categories/${cat.id}`, { method: 'DELETE' });
    onChanged();
  };

  if (editing)
    return (
      <div className="mt-2 rounded bg-blush-50 p-2">
        <div className="flex gap-2">
          <input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="w-12 rounded border border-blush-200 px-1 py-1 text-center" />
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 rounded border border-blush-200 px-2 py-1" />
        </div>
        <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Подзаголовок" className="mt-1.5 w-full rounded border border-blush-200 px-2 py-1 text-sm" />
        <div className="mt-1.5 flex gap-2">
          <button onClick={save} className="rounded bg-blush-600 px-3 py-1 text-xs font-semibold text-white">Сохранить</button>
          <button onClick={() => setEditing(false)} className="text-xs text-ink/50">Отмена</button>
        </div>
      </div>
    );

  return (
    <div className="mt-1.5 flex gap-1.5 text-xs">
      <button onClick={() => setEditing(true)} className="text-blush-700 hover:underline">Изменить</button>
      <button onClick={toggle} className="text-ink/50 hover:underline">
        {cat.isActive ? 'Скрыть' : 'Показать'}
      </button>
      <button onClick={remove} className="text-red-500 hover:underline">Удалить</button>
    </div>
  );
}

/* ─────────────── Управление подрядчиками блока ─────────────── */
function VendorManager({ category, onCountChanged }: { category: AdminCategory; onCountChanged: () => void }) {
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminVendor | 'new' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await api<AdminVendor[]>(`/api/admin/vendors?categoryId=${category.id}`);
    setVendors(list);
    setLoading(false);
  }, [category.id]);

  useEffect(() => {
    load();
  }, [load]);

  const reorder = async (next: AdminVendor[]) => {
    setVendors(next);
    await api('/api/admin/vendors/reorder', {
      method: 'POST',
      body: { categoryId: category.id, ids: next.map((v) => v.id) },
    }).catch(load);
  };

  const move = (id: string, dir: 'up' | 'top') => {
    const idx = vendors.findIndex((v) => v.id === id);
    if (idx <= 0) return;
    const arr = [...vendors];
    const [item] = arr.splice(idx, 1);
    arr.splice(dir === 'top' ? 0 : idx - 1, 0, item);
    reorder(arr);
  };

  const toggle = async (v: AdminVendor, field: 'isActive' | 'isFeatured') => {
    await api(`/api/admin/vendors/${v.id}`, { method: 'PATCH', body: { [field]: !v[field] } });
    load();
  };

  const remove = async (v: AdminVendor) => {
    if (!confirm(`Удалить подрядчика «${v.name}»?`)) return;
    await api(`/api/admin/vendors/${v.id}`, { method: 'DELETE' });
    load();
    onCountChanged();
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">
          {category.emoji} {category.title}
        </h2>
        <button
          onClick={() => setEditing('new')}
          className="rounded-lg bg-blush-600 px-3 py-2 text-sm font-semibold text-white active:scale-95"
        >
          + Подрядчик
        </button>
      </div>

      {editing && (
        <VendorForm
          categoryId={category.id}
          vendor={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
            onCountChanged();
          }}
        />
      )}

      {loading ? (
        <p className="p-4 text-center text-ink/50">Загрузка…</p>
      ) : vendors.length === 0 ? (
        <p className="rounded-lg bg-blush-50 p-6 text-center text-sm text-ink/50">
          В этом блоке пока нет подрядчиков.
        </p>
      ) : (
        <ul className="space-y-2">
          {vendors.map((v, i) => (
            <li key={v.id} className="flex items-center gap-3 rounded-lg border border-blush-100 p-2.5">
              <div className="flex flex-col gap-1">
                <IconBtn title="Наверх" disabled={i === 0} onClick={() => move(v.id, 'top')}>⤒</IconBtn>
                <IconBtn title="Выше" disabled={i === 0} onClick={() => move(v.id, 'up')}>↑</IconBtn>
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate font-medium ${v.isActive ? 'text-ink' : 'text-ink/40 line-through'}`}>
                  {v.isFeatured && '⭐ '}
                  {v.name}
                </p>
                <p className="truncate text-xs text-ink/50">
                  {[v.city, formatPrice(v.priceFrom)]
                    .filter(Boolean)
                    .join(' · ') || 'без деталей'}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-1">
                <IconBtn title={v.isFeatured ? 'Убрать из рекомендуемых' : 'В рекомендуемые'} onClick={() => toggle(v, 'isFeatured')}>⭐</IconBtn>
                <IconBtn title={v.isActive ? 'Скрыть' : 'Показать'} onClick={() => toggle(v, 'isActive')}>{v.isActive ? '👁' : '🚫'}</IconBtn>
                <IconBtn title="Изменить" onClick={() => setEditing(v)}>✎</IconBtn>
                <IconBtn title="Удалить" danger onClick={() => remove(v)}>🗑</IconBtn>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─────────────── Форма подрядчика ─────────────── */
function VendorForm({
  categoryId,
  vendor,
  onClose,
  onSaved,
}: {
  categoryId: string;
  vendor: AdminVendor | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState({
    name: vendor?.name ?? '',
    description: vendor?.description ?? '',
    city: vendor?.city ?? '',
    priceFrom: vendor?.priceFrom?.toString() ?? '',
    imageUrl: vendor?.imageUrl ?? '',
    phone: vendor?.phone ?? '',
    telegram: vendor?.telegram ?? '',
    whatsapp: vendor?.whatsapp ?? '',
    instagram: vendor?.instagram ?? '',
    website: vendor?.website ?? '',
    isFeatured: vendor?.isFeatured ?? false,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const set = (k: keyof typeof f, v: string | boolean) => setF((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setErr('');
    if (!f.name.trim()) {
      setErr('Укажите название');
      return;
    }
    setBusy(true);
    const body = {
      categoryId,
      name: f.name,
      description: f.description,
      city: f.city,
      priceFrom: f.priceFrom ? Number(f.priceFrom) : null,
      imageUrl: f.imageUrl,
      phone: f.phone,
      telegram: f.telegram,
      whatsapp: f.whatsapp,
      instagram: f.instagram,
      website: f.website,
      isFeatured: f.isFeatured,
    };
    try {
      if (vendor) {
        await api(`/api/admin/vendors/${vendor.id}`, { method: 'PATCH', body });
      } else {
        await api('/api/admin/vendors', { method: 'POST', body });
      }
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const field = (
    label: string,
    key: keyof typeof f,
    props: { placeholder?: string; textarea?: boolean; type?: string } = {}
  ) => (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink/60">{label}</span>
      {props.textarea ? (
        <textarea
          value={f[key] as string}
          onChange={(e) => set(key, e.target.value)}
          placeholder={props.placeholder}
          rows={3}
          className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm outline-none focus:border-blush-500"
        />
      ) : (
        <input
          value={f[key] as string}
          onChange={(e) => set(key, e.target.value)}
          placeholder={props.placeholder}
          type={props.type}
          inputMode={props.type === 'number' ? 'numeric' : undefined}
          className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm outline-none focus:border-blush-500"
        />
      )}
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-xl2 bg-white p-4 shadow-card sm:rounded-xl2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">{vendor ? 'Изменить подрядчика' : 'Новый подрядчик'}</h3>
          <button onClick={onClose} className="text-ink/40">✕</button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">{field('Название *', 'name', { placeholder: 'Студия «Момент»' })}</div>
          <div className="sm:col-span-2">{field('Описание', 'description', { textarea: true, placeholder: 'Коротко об услугах' })}</div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/60">Город</span>
            <select
              value={f.city}
              onChange={(e) => set('city', e.target.value)}
              className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm outline-none focus:border-blush-500"
            >
              <option value="">— не выбран —</option>
              {UZ_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          {field('Цена от, сум', 'priceFrom', { type: 'number', placeholder: '5000000' })}
          <div className="sm:col-span-2">{field('Ссылка на фото (URL)', 'imageUrl', { placeholder: 'https://…' })}</div>
          {field('Телефон', 'phone', { placeholder: PHONE_PLACEHOLDER })}
          {field('Telegram', 'telegram', { placeholder: 'username' })}
          {field('WhatsApp', 'whatsapp', { placeholder: PHONE_PLACEHOLDER })}
          {field('Instagram', 'instagram', { placeholder: 'username' })}
          <div className="sm:col-span-2">{field('Сайт', 'website', { placeholder: 'https://…' })}</div>
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} />
          Отметить как рекомендуемого ⭐
        </label>

        {err && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}

        <div className="mt-4 flex gap-2">
          <button onClick={save} disabled={busy} className="flex-1 rounded-lg bg-blush-600 py-2.5 font-semibold text-white disabled:opacity-60">
            {busy ? 'Сохраняем…' : 'Сохранить'}
          </button>
          <button onClick={onClose} className="rounded-lg px-4 py-2.5 text-ink/60 ring-1 ring-blush-200">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
