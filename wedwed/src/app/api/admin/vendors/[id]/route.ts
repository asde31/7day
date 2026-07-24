import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { vendorUpdateSchema } from '@/lib/validation';
import { ok, fail, handleError, invalidateCatalog } from '@/lib/api';

// Всегда динамический (использует cookies/сессию).
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => null);
    const data = vendorUpdateSchema.parse(body);

    // Если меняется блок — ставим в конец нового блока.
    let positionUpdate: number | undefined;
    if (data.categoryId) {
      const current = await prisma.vendor.findUnique({ where: { id: params.id } });
      if (!current) return fail('Подрядчик не найден', 404);
      if (current.categoryId !== data.categoryId) {
        const max = await prisma.vendor.aggregate({
          where: { categoryId: data.categoryId },
          _max: { position: true },
        });
        positionUpdate = (max._max.position ?? -1) + 1;
      }
    }

    const vendor = await prisma.vendor.update({
      where: { id: params.id },
      data: {
        ...data,
        priceFrom: data.priceFrom ?? undefined,
        ...(positionUpdate !== undefined ? { position: positionUpdate } : {}),
      },
    });
    invalidateCatalog();
    return ok(vendor);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await prisma.vendor.delete({ where: { id: params.id } });
    invalidateCatalog();
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
