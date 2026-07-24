import { NextResponse } from 'next/server';
import { getPublicCatalog, handleError } from '@/lib/api';

// Кэшируемый публичный эндпоинт каталога.
export const dynamic = 'force-dynamic'; // управляем кэшем через unstable_cache

export async function GET() {
  try {
    const catalog = await getPublicCatalog();
    const res = NextResponse.json({ ok: true, data: catalog });
    // CDN/edge-кэш: разрешаем отдавать закэшированный ответ и обновлять в фоне.
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res;
  } catch (e) {
    return handleError(e);
  }
}
