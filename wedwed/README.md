# WedCatalog — свадебный каталог подрядчиков

Telegram Mini App **и** обычный сайт (одна кодовая база) с каталогом свадебных
подрядчиков по блокам-категориям и **админ-панелью**: добавляйте подрядчиков в
каждый блок, редактируйте, скрывайте и **поднимайте наверх** одним нажатием.

> Без платёжных систем. Построено с расчётом на высокую нагрузку
> (публичный каталог кэшируется и рассчитан на тысячи одновременных читателей).

## Технологии

- **Next.js 14** (App Router) + **React 18** + **TypeScript** — сайт, Mini App и API в одном проекте
- **Tailwind CSS** — мобильный, «свадебный» дизайн
- **PostgreSQL + Prisma** — надёжное хранилище с индексами и транзакциями
- **Telegram WebApp SDK** — нативная интеграция с Telegram (тема, разворот на весь экран)
- Аутентификация админки — **JWT в httpOnly-cookie** (`jose`), пароль — **bcrypt**

## Почему выдерживает нагрузку (≈3000+ одновременно)

- Публичный каталог читается через **общий кэш** (`unstable_cache`, тег `catalog`)
  — БД опрашивается не чаще ~1 раза в 60 c на инстанс, а не на каждый запрос.
- Ответы каталога отдаются с заголовком `Cache-Control: s-maxage, stale-while-revalidate`
  — их можно кэшировать на CDN/edge.
- Любое изменение в админке мгновенно сбрасывает кэш через `revalidateTag`.
- Пул соединений Prisma настраивается прямо в `DATABASE_URL` (`connection_limit`).
- Приложение **stateless** — масштабируется горизонтально (несколько инстансов за балансировщиком).

## Безопасность («без дыр»)

- Все admin-эндпоинты защищены проверкой сессии (`requireAdmin`).
- Пароль хранится только как **bcrypt-хэш** (в `.env`, в base64 — чтобы `$`
  не ломался при загрузке переменных окружения).
- Сессия — **httpOnly**, `SameSite=Lax`, `Secure` в проде; подпись HS256.
- **Rate-limiting** на вход: 8 попыток за 5 минут с IP.
- Вся валидация входных данных — через **zod**; SQL-инъекции исключены (Prisma).
- Проверка подлинности Telegram `initData` по HMAC-SHA256 (см. `src/lib/telegram.ts`).
- Заголовки безопасности: `X-Content-Type-Options`, `Referrer-Policy`,
  `Content-Security-Policy: frame-ancestors` (клик-джекинг закрыт, фрейм разрешён
  только Telegram), скрыт `X-Powered-By`.

## Быстрый старт

```bash
cd wedwed
npm install
cp .env.example .env         # затем отредактируйте .env (см. ниже)

# 1) Поднять PostgreSQL (Docker)
docker compose up -d

# 2) Создать таблицы и наполнить блоками-категориями
npm run db:push
npm run db:seed

# 3) Запустить
npm run dev                  # http://localhost:3000  (сайт)
                             # http://localhost:3000/admin  (админка)
```

### Настройка `.env`

| Переменная | Назначение |
| --- | --- |
| `DATABASE_URL` | Строка подключения к PostgreSQL |
| `AUTH_SECRET` | Секрет подписи сессий (≥32 симв.). `openssl rand -base64 48` |
| `ADMIN_USERNAME` | Логин админки |
| `ADMIN_PASSWORD_HASH` | base64(bcrypt-хэш). Сгенерировать: `npm run hash "ваш-пароль"` |
| `TELEGRAM_BOT_TOKEN` | Токен бота из @BotFather (для проверки Mini App) |
| `NEXT_PUBLIC_APP_URL` | Публичный адрес приложения |

Пароль по умолчанию — `admin123` (**обязательно смените**):

```bash
npm run hash "мой-надёжный-пароль"
# вставьте результат в ADMIN_PASSWORD_HASH
```

## Подключение как Telegram Mini App

1. Создайте бота у **@BotFather** → получите токен → впишите в `TELEGRAM_BOT_TOKEN`.
2. Разверните приложение на HTTPS-домене (Vercel / свой сервер + reverse-proxy).
3. В @BotFather: `/newapp` (или `/setmenubutton`) → укажите URL приложения.
4. Готово: кнопка в боте откроет каталог как Mini App. Тот же URL работает и как сайт.

## Как пользоваться админкой

`/admin` → вход по логину/паролю. Далее:

- **Блоки сайта** (левая колонка): создавайте, переименовывайте, скрывайте,
  удаляйте и переупорядочивайте (`↑` выше, `⤒` наверх).
- **Подрядчики** (правая колонка): выберите блок → **+ Подрядчик**. Заполните
  название, описание, город, цену, фото (URL) и контакты (телефон, Telegram,
  WhatsApp, Instagram, сайт).
- У каждого подрядчика: `⤒` поднять наверх, `↑` выше, `⭐` рекомендуемый,
  `👁` показать/скрыть, `✎` изменить, `🗑` удалить.

## Структура

```
wedwed/
├─ prisma/schema.prisma      # модели Category / Vendor
├─ prisma/seed.ts            # стартовые блоки-категории
├─ src/lib/                  # db, auth, telegram, rate-limit, validation, api-кэш
├─ src/app/                  # страницы (/, /admin) и API-роуты
│  ├─ api/catalog            # публичный кэшируемый каталог
│  └─ api/admin/*            # защищённые CRUD + reorder
├─ src/components/           # VendorCard, CategoryNav, TelegramInit
└─ docker-compose.yml        # PostgreSQL для локальной разработки
```

## Проверки

```bash
npm run typecheck   # tsc --noEmit
npm run build       # прод-сборка
```

## Прод-развёртывание

- **Vercel**: подключите репозиторий (root = `wedwed`), задайте переменные
  окружения, подключите управляемый PostgreSQL (Neon/Supabase/RDS). ISR и кэш
  каталога работают из коробки.
- **Свой сервер**: `npm run build && npm run start` за Nginx (HTTPS обязателен
  для Telegram). Запускайте несколько инстансов + общий PostgreSQL для масштаба.
