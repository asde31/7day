import { getSession } from '@/lib/auth';
import { ok, handleError } from '@/lib/api';

// Всегда динамический (использует cookies/сессию).
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    return ok({ authenticated: !!session, username: session?.username ?? null });
  } catch (e) {
    return handleError(e);
  }
}
