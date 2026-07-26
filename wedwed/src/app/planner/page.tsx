import type { Metadata } from 'next';
import TelegramInit from '@/components/TelegramInit';
import Planner from '@/components/Planner';

export const metadata: Metadata = {
  title: 'Планировщик свадьбы — Uzlav',
  description: 'Чек-лист дел, бюджет и список гостей для подготовки к свадьбе.',
};

export default function PlannerPage() {
  return (
    <>
      <TelegramInit />
      <div className="aurora" aria-hidden>
        <span className="b1" />
        <span className="b2" />
        <span className="b3" />
      </div>
      <Planner />
    </>
  );
}
