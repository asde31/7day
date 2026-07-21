# 7day

Приложение утренней и повседневной дисциплины для рынка Узбекистана: умный
будильник с accountability-механикой, трекер воды, дыхательные практики (в т.ч.
для управления тягой к курению), а также фитнес и AI-трекер питания в следующих
фазах.

> **Статус:** Фаза 1 (MVP) — будильник + accountability, трекер воды, базовые
> дыхательные практики. Реализовано на React Native + Expo, offline-first.
> Дорожная карта по остальным модулям — в [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Что уже работает

| Модуль | Готовность | Экран |
| --- | --- | --- |
| Будильник + accountability | ✅ Фаза 1 | `app/(tabs)/alarm.tsx`, `app/alarm/*` |
| Миссии (математика/шаги/аффирмация/фото) | ✅ Фаза 1 | `src/features/missions/*` |
| Streak + история (календарь) | ✅ Фаза 1 | `app/alarm/history.tsx` |
| Привязка к Fajr (расчёт по городу) | ✅ Фаза 1 | `src/features/alarm/fajr.ts` |
| Трекер воды + напоминания | ✅ Фаза 1 | `app/(tabs)/water.tsx` |
| Дыхательные практики + SOS + статистика | ✅ Фаза 1 | `app/(tabs)/breathing.tsx`, `app/breathing/*` |
| Локализация ru / uz / en | ✅ Фаза 1 | `src/lib/i18n/*` |
| AI-питание (фото → калории на Haiku) | ✅ Фаза 2 | `app/(tabs)/nutrition.tsx`, `supabase/functions/recognize-food/` |
| Фитнес (видео, GPS-бег) | 🔜 Фаза 3 | — |

## Стек

- **Frontend:** React Native + Expo (SDK 51), Expo Router, TypeScript
- **State:** Zustand + persist (AsyncStorage) — **offline-first**
- **Backend (опционально):** Supabase (Postgres + Auth + Storage) — см. `supabase/`
- **Уведомления:** `expo-notifications` (локальные, работают offline)
- **Датчики/камера/гео:** `expo-sensors`, `expo-camera`, `expo-location`
- **i18n:** `i18next` + `react-i18next` (русский по умолчанию)

## Быстрый старт

```bash
npm install
cp .env.example .env      # опционально: Supabase для облачной синхронизации
npm start                 # затем 'i' (iOS), 'a' (Android) или сканировать QR в Expo Go
```

Приложение полностью работает **без** Supabase: будильник, вода и дыхание
хранятся на устройстве. Облачная синхронизация и авторизация включаются, когда
заданы `EXPO_PUBLIC_SUPABASE_URL` и `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

### Проверки

```bash
npm test        # unit-тесты бизнес-логики (Jest) — 22 теста
npm run typecheck   # tsc --noEmit
npm run lint
```

### Сборка

```bash
npx eas build --platform android --profile preview   # APK для теста
npx eas build --platform ios --profile production
```

## AI-питание (фото → калории)

Фото еды распознаётся через **Claude Haiku 4.5** (vision) в Supabase Edge
Function — ключ Anthropic живёт только на сервере, в приложение не попадает.
**Фото не хранится**: приложение уменьшает снимок до ~1024px, шлёт base64 в
функцию, та возвращает структурный результат (блюдо, ккал, БЖУ), фото
отбрасывается. Сохраняется только результат, который пользователь подтвердил.

Стоимость ≈ $0.003 за фото (см. обсуждение экономики); узбекская кухня — в
приоритете промпта. Результат всегда редактируемый перед сохранением, т.к. ИИ
оценивает приблизительно.

```bash
# Развернуть функцию распознавания
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions deploy recognize-food
```

Без настроенного Supabase остальное приложение (будильник, вода, дыхание)
работает как прежде; экран сканирования сообщит, что AI не сконфигурирован.

## Архитектура

Вся доменная логика вынесена в чистые, тестируемые функции
(`src/features/*/logic.ts`), UI — тонкий слой поверх Zustand-сторов. Подробности,
включая план надёжного Android-будильника (foreground service / full-screen
intent) и интеграции Claude API для распознавания еды —
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Открытые вопросы из ТЗ

Ответы и рекомендации по названию, монетизации, платформам, юридическому аспекту
дыхательного модуля и локализации собраны в
[`docs/ROADMAP.md`](docs/ROADMAP.md#открытые-вопросы).

## Структура

```
app/                 экраны (Expo Router: табы + модальные)
src/
  components/        переиспользуемый UI (Screen, Card, Button, …)
  features/          доменная логика по модулям + тестируемые функции
    alarm/  water/  breathing/  missions/
  lib/               notifications, supabase, storage, i18n
  store/             Zustand-сторы (persist)
  theme/             дизайн-токены + провайдер темы
  types/             общие доменные типы
supabase/migrations/ SQL-схема + RLS
__tests__/           unit-тесты
docs/                ARCHITECTURE, ROADMAP
```

## Дисклеймер

Дыхательный модуль позиционируется как **вспомогательный** инструмент управления
тягой, а не как медицинское средство лечения зависимости. Обязательный
дисклеймер отображается в UI (`breathing.disclaimer`). См.
[`docs/ROADMAP.md`](docs/ROADMAP.md) о юридических формулировках.
