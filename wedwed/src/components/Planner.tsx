'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Tab = 'tasks' | 'budget' | 'guests';

interface Task { id: string; text: string; done: boolean }
interface BudgetItem { id: string; name: string; planned: number; paid: number }
interface Guest { id: string; name: string; side: 'жених' | 'невеста' | 'общие'; coming: boolean }

const uid = () => Math.random().toString(36).slice(2, 10);

function useStored<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [val, setVal] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setVal(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (ready) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    }
  }, [key, val, ready]);
  return [val, setVal];
}

const DEFAULT_TASKS: Task[] = [
  { id: uid(), text: 'Определить дату и бюджет', done: false },
  { id: uid(), text: 'Составить список гостей', done: false },
  { id: uid(), text: 'Выбрать площадку', done: false },
  { id: uid(), text: 'Забронировать ведущего и фотографа', done: false },
  { id: uid(), text: 'Заказать торт и оформление', done: false },
];

const money = (n: number) => `${n.toLocaleString('ru-RU')} сум`;

export default function Planner() {
  const [tab, setTab] = useState<Tab>('tasks');

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6">
      <div className="mb-4 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:underline">Главная</Link>
        <span>/</span>
        <span className="text-ink">Планировщик</span>
      </div>

      <div className="glass rounded-3xl px-6 py-7">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Планировщик свадьбы</h1>
        <p className="mt-1 text-muted">Чек-лист, бюджет и список гостей — сохраняются на вашем устройстве.</p>
      </div>

      <div className="my-5 flex gap-2">
        {([['tasks', '✅ Чек-лист'], ['budget', '💰 Бюджет'], ['guests', '👥 Гости']] as [Tab, string][]).map(
          ([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                tab === t ? 'text-white' : 'glass-pill text-ink'
              }`}
              style={tab === t ? { background: 'var(--accent-gold-dk)' } : undefined}
            >
              {label}
            </button>
          )
        )}
      </div>

      {tab === 'tasks' && <Tasks />}
      {tab === 'budget' && <Budget />}
      {tab === 'guests' && <Guests />}
    </div>
  );
}

function Tasks() {
  const [tasks, setTasks] = useStored<Task[]>('uzlav_tasks', DEFAULT_TASKS);
  const [text, setText] = useState('');
  const done = tasks.filter((t) => t.done).length;

  const add = () => {
    if (!text.trim()) return;
    setTasks((p) => [...p, { id: uid(), text: text.trim(), done: false }]);
    setText('');
  };

  return (
    <div className="glass rounded-3xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">Выполнено: <b className="text-ink">{done}</b> из {tasks.length}</p>
      </div>
      <div className="mb-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Новая задача"
          className="flex-1 rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm outline-none focus:border-white"
        />
        <button onClick={add} className="rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: 'var(--accent-gold-dk)' }}>
          Добавить
        </button>
      </div>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-3 rounded-xl bg-white/50 px-3 py-2.5">
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => setTasks((p) => p.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
              className="h-5 w-5 accent-[color:var(--accent-gold-dk)]"
            />
            <span className={`flex-1 text-sm ${t.done ? 'text-muted line-through' : 'text-ink'}`}>{t.text}</span>
            <button onClick={() => setTasks((p) => p.filter((x) => x.id !== t.id))} className="text-muted hover:text-ink">✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Budget() {
  const [items, setItems] = useStored<BudgetItem[]>('uzlav_budget', []);
  const [name, setName] = useState('');
  const [planned, setPlanned] = useState('');
  const totalPlanned = items.reduce((s, i) => s + i.planned, 0);
  const totalPaid = items.reduce((s, i) => s + i.paid, 0);

  const add = () => {
    if (!name.trim()) return;
    setItems((p) => [...p, { id: uid(), name: name.trim(), planned: Number(planned) || 0, paid: 0 }]);
    setName('');
    setPlanned('');
  };

  return (
    <div className="glass rounded-3xl p-5">
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/50 p-3 text-center">
          <p className="text-xs text-muted">План</p>
          <p className="text-lg font-bold text-ink">{money(totalPlanned)}</p>
        </div>
        <div className="rounded-xl bg-white/50 p-3 text-center">
          <p className="text-xs text-muted">Оплачено</p>
          <p className="text-lg font-bold" style={{ color: 'var(--accent-emerald)' }}>{money(totalPaid)}</p>
        </div>
      </div>
      <div className="mb-4 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Статья (площадка…)" className="flex-1 rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm outline-none" />
        <input value={planned} onChange={(e) => setPlanned(e.target.value.replace(/[^\d]/g, ''))} inputMode="numeric" placeholder="сумма" className="w-28 rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm outline-none" />
        <button onClick={add} className="rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: 'var(--accent-gold-dk)' }}>+</button>
      </div>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className="rounded-xl bg-white/50 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink">{it.name}</span>
              <button onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))} className="text-muted hover:text-ink">✕</button>
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
              <span>План: {money(it.planned)}</span>
              <span>·</span>
              <span>Оплачено:</span>
              <input
                value={it.paid || ''}
                onChange={(e) => {
                  const v = Number(e.target.value.replace(/[^\d]/g, '')) || 0;
                  setItems((p) => p.map((x) => (x.id === it.id ? { ...x, paid: v } : x)));
                }}
                inputMode="numeric"
                placeholder="0"
                className="w-24 rounded-lg border border-white/60 bg-white/70 px-2 py-1 text-xs outline-none"
              />
            </div>
          </li>
        ))}
        {items.length === 0 && <p className="py-4 text-center text-sm text-muted">Добавьте первую статью расходов.</p>}
      </ul>
    </div>
  );
}

function Guests() {
  const [guests, setGuests] = useStored<Guest[]>('uzlav_guests', []);
  const [name, setName] = useState('');
  const [side, setSide] = useState<Guest['side']>('общие');
  const coming = guests.filter((g) => g.coming).length;

  const add = () => {
    if (!name.trim()) return;
    setGuests((p) => [...p, { id: uid(), name: name.trim(), side, coming: true }]);
    setName('');
  };

  return (
    <div className="glass rounded-3xl p-5">
      <p className="mb-4 text-sm text-muted">Гостей: <b className="text-ink">{guests.length}</b> · придут: <b className="text-ink">{coming}</b></p>
      <div className="mb-4 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Имя гостя" className="flex-1 rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm outline-none" />
        <select value={side} onChange={(e) => setSide(e.target.value as Guest['side'])} className="rounded-xl border border-white/60 bg-white/60 px-2 py-2 text-sm outline-none">
          <option value="общие">общие</option>
          <option value="жених">жених</option>
          <option value="невеста">невеста</option>
        </select>
        <button onClick={add} className="rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: 'var(--accent-gold-dk)' }}>+</button>
      </div>
      <ul className="space-y-2">
        {guests.map((g) => (
          <li key={g.id} className="flex items-center gap-3 rounded-xl bg-white/50 px-3 py-2.5">
            <input type="checkbox" checked={g.coming} onChange={() => setGuests((p) => p.map((x) => (x.id === g.id ? { ...x, coming: !x.coming } : x)))} className="h-5 w-5 accent-[color:var(--accent-gold-dk)]" />
            <span className={`flex-1 text-sm ${g.coming ? 'text-ink' : 'text-muted line-through'}`}>{g.name}</span>
            <span className="rounded-full bg-cream-deep px-2 py-0.5 text-[11px] text-muted">{g.side}</span>
            <button onClick={() => setGuests((p) => p.filter((x) => x.id !== g.id))} className="text-muted hover:text-ink">✕</button>
          </li>
        ))}
        {guests.length === 0 && <p className="py-4 text-center text-sm text-muted">Добавьте первого гостя.</p>}
      </ul>
    </div>
  );
}
