import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';
import { ok, fail, handleError, invalidateCatalog } from '@/lib/api';

const schema = z.object({
  categoryId: z.string().min(1).max(64),
  // Полный упорядоченный список id подрядчиков внутри блока.
  ids: z.array(z.string().min(1).max(64)).min(1).max(2000),
});

// Переупорядочивание подрядчиков внутри блока (в т.ч. «поднять наверх»).
// Всегда динамический (использует cookies/сессию).
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => null);
    const { categoryId, ids } = schema.parse(body);

    // Защита от подмены: все id должны принадлежать этому блоку.
    const owned = await prisma.vendor.findMany({
      where: { categoryId },
      select: { id: true },
    });
    const ownedSet = new Set(owned.map((v) => v.id));
    if (ids.length !== ownedSet.size || !ids.every((id) => ownedSet.has(id))) {
      return fail('Список подрядчиков не совпадает с блоком', 409);
    }

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.vendor.update({ where: { id }, data: { position: index } })
      )
    );
    invalidateCatalog();
    return ok({ reordered: ids.length });
  } catch (e) {
    return handleError(e);
  }
}
