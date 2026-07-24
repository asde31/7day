import { destroySession } from '@/lib/auth';
import { ok, handleError } from '@/lib/api';

// Всегда динамический (использует cookies/сессию).
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    destroySession();
    return ok({ loggedOut: true });
  } catch (e) {
    return handleError(e);
  }
}
