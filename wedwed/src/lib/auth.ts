import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const COOKIE_NAME = 'wedwed_admin';
const MAX_AGE = 60 * 60 * 8; // 8 часов

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET не задан или слишком короткий (минимум 32 символа).');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Достаёт bcrypt-хэш админ-пароля из окружения.
 * Значение хранится в base64 (см. scripts/hash-password.mjs), потому что сырой
 * bcrypt-хэш содержит "$" — их dotenv/Next раскрывают как переменные и портят.
 * Для совместимости поддерживаем и «сырой» хэш, если он не был искажён.
 */
function getPasswordHash(): string | null {
  const raw = process.env.ADMIN_PASSWORD_HASH;
  if (!raw) return null;
  if (raw.startsWith('$2')) return raw; // уже валидный bcrypt-хэш
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    if (decoded.startsWith('$2')) return decoded;
  } catch {
    /* ignore */
  }
  return null;
}

/** Проверяет логин/пароль по переменным окружения. */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME ?? 'admin';
  const hash = getPasswordHash();
  if (!hash) return false;
  // bcrypt.compare — постоянное по времени сравнение; проверку имени тоже
  // делаем всегда, чтобы не давать timing-разницы между «нет юзера» и «нет пароля».
  const userOk = safeEqual(username, expectedUser);
  const passOk = await bcrypt.compare(password, hash);
  return userOk && passOk;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Создаёт подписанную сессию и кладёт её в httpOnly cookie. */
export async function createSession(username: string): Promise<void> {
  const token = await new SignJWT({ sub: username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export function destroySession(): void {
  cookies().set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
}

/** Возвращает username, если сессия валидна, иначе null. */
export async function getSession(): Promise<{ username: string } | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== 'admin' || typeof payload.sub !== 'string') return null;
    return { username: payload.sub };
  } catch {
    return null;
  }
}

/** Бросает при отсутствии валидной сессии — использовать в admin API. */
export async function requireAdmin(): Promise<{ username: string }> {
  const session = await getSession();
  if (!session) {
    const err = new Error('Unauthorized');
    (err as Error & { status?: number }).status = 401;
    throw err;
  }
  return session;
}
