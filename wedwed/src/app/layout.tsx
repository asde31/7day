import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Свадебные подрядчики Узбекистана — каталог',
  description:
    'Каталог свадебных подрядчиков Узбекистана: площадки, ведущие, фотографы, декор, музыка и другое. Фото, цены, прямые контакты.',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#712742',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        {/* Telegram Mini App SDK — доступен как window.Telegram.WebApp */}
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-screen text-ink antialiased">{children}</body>
    </html>
  );
}
