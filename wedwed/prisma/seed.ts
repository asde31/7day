import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Базовые блоки свадебного каталога. Их можно менять/добавлять из админки.
const categories = [
  { slug: 'venues', title: 'Площадки', subtitle: 'Рестораны, банкетные залы, лофты', emoji: '💒' },
  { slug: 'hosts', title: 'Ведущие', subtitle: 'Тамада и шоумены', emoji: '🎤' },
  { slug: 'photo', title: 'Фотографы', subtitle: 'Свадебная фотосъёмка', emoji: '📸' },
  { slug: 'video', title: 'Видеографы', subtitle: 'Видеосъёмка и клипы', emoji: '🎥' },
  { slug: 'decor', title: 'Декор и флористика', subtitle: 'Оформление, цветы', emoji: '💐' },
  { slug: 'music', title: 'Музыка и DJ', subtitle: 'Кавер-группы, диджеи', emoji: '🎶' },
  { slug: 'stylists', title: 'Визажисты и стилисты', subtitle: 'Причёска и макияж', emoji: '💄' },
  { slug: 'dresses', title: 'Платья и костюмы', subtitle: 'Салоны и ателье', emoji: '👰' },
  { slug: 'cakes', title: 'Торты и кейтеринг', subtitle: 'Кондитеры, фуршет', emoji: '🎂' },
  { slug: 'transport', title: 'Транспорт', subtitle: 'Авто, лимузины, кортеж', emoji: '🚘' },
  { slug: 'organizers', title: 'Организаторы', subtitle: 'Свадебные агентства', emoji: '🤝' },
];

async function main() {
  console.log('🌱 Заполняем блоки каталога...');

  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { title: c.title, subtitle: c.subtitle, emoji: c.emoji },
      create: { ...c, position: i },
    });
  }

  // Пара демонстрационных подрядчиков, чтобы каталог не был пустым.
  const photo = await prisma.category.findUnique({ where: { slug: 'photo' } });
  if (photo) {
    const count = await prisma.vendor.count({ where: { categoryId: photo.id } });
    if (count === 0) {
      await prisma.vendor.createMany({
        data: [
          {
            categoryId: photo.id,
            name: 'Студия «Момент»',
            description: 'Естественная репортажная съёмка. Более 200 свадеб.',
            city: 'Москва',
            priceFrom: 25000,
            phone: '+7 900 000-00-01',
            telegram: 'moment_studio',
            position: 0,
            isFeatured: true,
          },
          {
            categoryId: photo.id,
            name: 'Анна Лебедева',
            description: 'Тёплая плёночная эстетика, выездные съёмки по России.',
            city: 'Санкт-Петербург',
            priceFrom: 30000,
            phone: '+7 900 000-00-02',
            position: 1,
          },
        ],
      });
    }
  }

  console.log('✅ Готово.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
