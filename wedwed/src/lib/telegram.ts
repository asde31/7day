import crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

/**
 * Проверяет подлинность initData из Telegram Mini App по алгоритму Telegram:
 * secret = HMAC-SHA256(bot_token, "WebAppData")
 * hash   = HMAC-SHA256(data_check_string, secret)
 * Возвращает данные пользователя или null, если подпись невалидна/просрочена.
 */
export function verifyTelegramInitData(
  initData: string,
  maxAgeSeconds = 86400
): { user: TelegramUser | null } | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !initData) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  const computed = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  // Постоянное по времени сравнение.
  const a = Buffer.from(computed, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const authDate = Number(params.get('auth_date'));
  if (authDate && Date.now() / 1000 - authDate > maxAgeSeconds) return null;

  let user: TelegramUser | null = null;
  const userRaw = params.get('user');
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }
  return { user };
}
