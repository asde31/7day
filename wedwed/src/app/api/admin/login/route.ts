import { NextRequest } from 'next/server';
import { verifyCredentials, createSession } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { ok, fail, handleError } from '@/lib/api';

// Всегда динамический (использует cookies/сессию).
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Жёсткий лимит на попытки входа: 8 попыток за 5 минут с одного IP.
    const ip = clientIp(req.headers);
    const rl = rateLimit(`login:${ip}`, 8, 5 * 60_000);
    if (!rl.ok) {
      return fail(`Слишком много попыток. Повторите через ${rl.retryAfter} с.`, 429);
    }

    const body = await req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return fail('Неверные данные', 422, parsed.error.flatten());

    const valid = await verifyCredentials(parsed.data.username, parsed.data.password);
    if (!valid) return fail('Неверный логин или пароль', 401);

    await createSession(parsed.data.username);
    return ok({ username: parsed.data.username });
  } catch (e) {
    return handleError(e);
  }
}
