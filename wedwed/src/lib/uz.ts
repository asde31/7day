// Данные и хелперы для региона «Узбекистан».

export const REGION_NAME = 'Узбекистан';

// Города Узбекистана (областные центры и крупные города).
export const UZ_CITIES = [
  'Ташкент',
  'Самарканд',
  'Бухара',
  'Андижан',
  'Наманган',
  'Фергана',
  'Нукус',
  'Карши',
  'Коканд',
  'Маргилан',
  'Термез',
  'Джизак',
  'Ургенч',
  'Навои',
  'Гулистан',
  'Нурафшан',
  'Ангрен',
  'Чирчик',
  'Алмалык',
  'Бекабад',
  'Шахрисабз',
  'Хива',
  'Зарафшан',
  'Каттакурган',
  'Денау',
  'Янгиюль',
  'Ахангаран',
  'Асака',
  'Чуст',
  'Каган',
] as const;

// Форматирование цены в узбекских сумах.
export function formatPrice(n: number | null | undefined): string | null {
  if (n == null) return null;
  return `от ${n.toLocaleString('ru-RU')} сум`;
}

// Пример-подсказка для телефона.
export const PHONE_PLACEHOLDER = '+998 90 123-45-67';

// Красивый градиент для плитки категории (детерминированно по индексу).
const TILE_GRADIENTS = [
  'from-rose-200 to-rose-100',
  'from-amber-200 to-rose-100',
  'from-emerald-200 to-teal-100',
  'from-sky-200 to-indigo-100',
  'from-fuchsia-200 to-rose-100',
  'from-orange-200 to-amber-100',
  'from-violet-200 to-fuchsia-100',
  'from-teal-200 to-emerald-100',
  'from-pink-200 to-rose-100',
  'from-indigo-200 to-sky-100',
  'from-lime-200 to-emerald-100',
];

export function tileGradient(index: number): string {
  return TILE_GRADIENTS[index % TILE_GRADIENTS.length];
}
