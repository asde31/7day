import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { reorderSchema } from '@/lib/validation';
import { ok, handleError, invalidateCatalog } from '@/lib/api';

// Меняет порядок блоков. ids — полный список id в нужном порядке.
// Всегда динамический (использует cookies/сессию).
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => null);
    const { ids } = reorderSchema.parse(body);

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.category.update({ where: { id }, data: { position: index } })
      )
    );
    invalidateCatalog();
    return ok({ reordered: ids.length });
  } catch (e) {
    return handleError(e);
  }
}
