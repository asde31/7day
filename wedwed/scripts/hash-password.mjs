// Утилита: генерирует bcrypt-хэш пароля для ADMIN_PASSWORD_HASH.
// Использование: node scripts/hash-password.mjs "мой-пароль"
import bcrypt from 'bcryptjs';

const pwd = process.argv[2];
if (!pwd) {
  console.error('Использование: node scripts/hash-password.mjs "пароль"');
  process.exit(1);
}
const hash = bcrypt.hashSync(pwd, 10);
// Кодируем в base64: bcrypt-хэш содержит символы "$", которые dotenv/Next
// пытаются раскрыть как переменные и портят значение. base64 это исключает.
console.log(Buffer.from(hash, 'utf8').toString('base64'));
