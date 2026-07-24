import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { vendorCreateSchema } from '@/lib/validation';
import { ok, fail, handleError, invalidateCatalog } from '@/lib/api';

// Список подрядчиков блока для админки (?categoryId=...).
// Всегда динамический (использует cookies/сессию).
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const categoryId = req.nextUrl.searchParams.get('categoryId');
    const vendors = await prisma.vendor.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: [{ categoryId: 'asc' }, { position: 'asc' }],
    });
    return ok(vendors);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => null);
    const data = vendorCreateSchema.parse(body);

    // Блок должен существовать.
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) return fail('Блок не найден', 404);

    // Новый подрядчик добавляется в конец блока.
    const max = await prisma.vendor.aggregate({
      where: { categoryId: data.categoryId },
      _max: { position: true },
    });

    const vendor = await prisma.vendor.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        city: data.city,
        priceFrom: data.priceFrom ?? undefined,
        imageUrl: data.imageUrl,
        phone: data.phone,
        telegram: data.telegram,
        instagram: data.instagram,
        whatsapp: data.whatsapp,
        website: data.website,
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? true,
        position: (max._max.position ?? -1) + 1,
      },
    });
    invalidateCatalog();
    return ok(vendor, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
