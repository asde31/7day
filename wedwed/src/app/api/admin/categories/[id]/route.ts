import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { categoryUpdateSchema } from '@/lib/validation';
import { ok, handleError, invalidateCatalog } from '@/lib/api';

// Всегда динамический (использует cookies/сессию).
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = categoryUpdateSchema.parse(body);
    const category = await prisma.category.update({
      where: { id: params.id },
      data: parsed,
    });
    invalidateCatalog();
    return ok(category);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    // Каскадно удаляет подрядчиков внутри блока (onDelete: Cascade).
    await prisma.category.delete({ where: { id: params.id } });
    invalidateCatalog();
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
