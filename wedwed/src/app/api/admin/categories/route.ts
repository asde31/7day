import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { categoryCreateSchema } from '@/lib/validation';
import { ok, fail, handleError, invalidateCatalog } from '@/lib/api';

function slugify(input: string): string {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
    и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
    ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  const base = input
    .toLowerCase()
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
  return base || `blok-${Date.now().toString(36)}`;
}

// Полный список блоков для админки (включая неактивные) + счётчик подрядчиков.
// Всегда динамический (использует cookies/сессию).
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    const categories = await prisma.category.findMany({
      orderBy: { position: 'asc' },
      include: { _count: { select: { vendors: true } } },
    });
    return ok(categories);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = categoryCreateSchema.parse(body);

    let slug = parsed.slug ?? slugify(parsed.title);
    // Гарантируем уникальность slug.
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const max = await prisma.category.aggregate({ _max: { position: true } });
    const category = await prisma.category.create({
      data: {
        slug,
        title: parsed.title,
        subtitle: parsed.subtitle,
        emoji: parsed.emoji || '💍',
        position: (max._max.position ?? -1) + 1,
      },
    });
    invalidateCatalog();
    return ok(category, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
