'use client';

import { useEffect } from 'react';

// Инициализация Telegram Mini App: разворачиваем на весь экран, включаем
// подтверждение закрытия, синхронизируем тему. Безопасно работает и вне
// Telegram (в обычном браузере) — тогда просто ничего не делает.
export default function TelegramInit() {
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    if (!tg) return;
    try {
      tg.ready();
      tg.expand();
      if (typeof tg.enableClosingConfirmation === 'function') {
        tg.enableClosingConfirmation();
      }
      // Прокидываем цвета темы Telegram в CSS-переменные.
      const p = tg.themeParams || {};
      const root = document.documentElement;
      const set = (k: string, v?: string) => v && root.style.setProperty(k, v);
      set('--tg-theme-bg-color', p.bg_color);
      set('--tg-theme-text-color', p.text_color);
      set('--tg-theme-secondary-bg-color', p.secondary_bg_color);
      set('--tg-theme-hint-color', p.hint_color);
    } catch {
      /* no-op */
    }
  }, []);

  return null;
}
