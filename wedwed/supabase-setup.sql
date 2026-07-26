-- ╔════════════════════════════════════════════════════════════════════════╗
-- ║  WedCatalog — установка базы в Supabase                                  ║
-- ║  Вставьте весь этот файл в Supabase → SQL Editor → New query → Run       ║
-- ╚════════════════════════════════════════════════════════════════════════╝

-- Для генерации идентификаторов
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Таблицы ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "emoji" TEXT NOT NULL DEFAULT '💍',
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Vendor" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "city" TEXT,
    "address" TEXT,
    "priceFrom" INTEGER,
    "capacity" INTEGER,
    "tags" TEXT[] NOT NULL DEFAULT '{}',
    "imageUrl" TEXT,
    "phone" TEXT,
    "telegram" TEXT,
    "instagram" TEXT,
    "whatsapp" TEXT,
    "website" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- ─── Индексы ──────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");
CREATE INDEX IF NOT EXISTS "Category_position_idx" ON "Category"("position");
CREATE INDEX IF NOT EXISTS "Vendor_categoryId_position_idx" ON "Vendor"("categoryId", "position");
CREATE INDEX IF NOT EXISTS "Vendor_isActive_idx" ON "Vendor"("isActive");

-- ─── Связь (удаление блока удаляет его подрядчиков) ───────────────────────
DO $$ BEGIN
  ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Стартовые блоки каталога ─────────────────────────────────────────────
-- Добавляются только если блока с таким slug ещё нет (можно запускать повторно).
INSERT INTO "Category" ("id","slug","title","subtitle","emoji","position","updatedAt")
VALUES
  (gen_random_uuid()::text,'venues','Площадки','Рестораны, банкетные залы, лофты','💒',0,now()),
  (gen_random_uuid()::text,'hosts','Ведущие','Тамада и шоумены','🎤',1,now()),
  (gen_random_uuid()::text,'photo','Фотографы','Свадебная фотосъёмка','📸',2,now()),
  (gen_random_uuid()::text,'video','Видеографы','Видеосъёмка и клипы','🎥',3,now()),
  (gen_random_uuid()::text,'decor','Декор и флористика','Оформление, цветы','💐',4,now()),
  (gen_random_uuid()::text,'music','Музыка и DJ','Кавер-группы, диджеи','🎶',5,now()),
  (gen_random_uuid()::text,'stylists','Визажисты и стилисты','Причёска и макияж','💄',6,now()),
  (gen_random_uuid()::text,'dresses','Платья и костюмы','Салоны и ателье','👰',7,now()),
  (gen_random_uuid()::text,'cakes','Торты и кейтеринг','Кондитеры, фуршет','🎂',8,now()),
  (gen_random_uuid()::text,'transport','Транспорт','Авто, лимузины, кортеж','🚘',9,now()),
  (gen_random_uuid()::text,'organizers','Организаторы','Свадебные агентства','🤝',10,now())
ON CONFLICT ("slug") DO NOTHING;
