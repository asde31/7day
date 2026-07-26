import { NextResponse } from 'next/server';
import { unstable_cache, revalidateTag } from 'next/cache';
import { ZodError } from 'zod';
import { prisma } from './db';

export const CATALOG_TAG = 'catalog';

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, extra?: unknown) {
  return NextResponse.json({ ok: false, error: message, details: extra }, { status });
}

/** Единый обработчик исключений для route handlers. */
export function handleError(e: unknown) {
  if (e instanceof ZodError) {
    return fail('Ошибка валидации', 422, e.flatten());
  }
  const status = (e as { status?: number })?.status;
  if (status === 401) return fail('Требуется авторизация', 401);
  console.error('[api] unhandled error:', e);
  return fail('Внутренняя ошибка сервера', 500);
}

export function invalidateCatalog() {
  revalidateTag(CATALOG_TAG);
}

/**
 * Публичный каталог: только активные блоки и активные подрядчики,
 * отсортированные по position. Результат кэшируется и разделяется между
 * всеми запросами — это ключ к нагрузке в тысячи одновременных читателей.
 */
export const getPublicCatalog = unstable_cache(
  async () => {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        emoji: true,
        vendors: {
          where: { isActive: true },
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
          select: {
            id: true,
            name: true,
            description: true,
            city: true,
            address: true,
            priceFrom: true,
            capacity: true,
            tags: true,
            imageUrl: true,
            phone: true,
            telegram: true,
            instagram: true,
            whatsapp: true,
            website: true,
            isFeatured: true,
          },
        },
      },
    });
    return categories;
  },
  ['public-catalog-v1'],
  { tags: [CATALOG_TAG], revalidate: 60 }
);

export type PublicCatalog = Awaited<ReturnType<typeof getPublicCatalog>>;
