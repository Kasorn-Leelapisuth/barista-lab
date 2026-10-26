import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.menuItem.deleteMany({});

  const items = [
    {
      name: 'Single Origin Batch Brew',
      category: 'Coffee',
      price: 5.5,
      description: 'Rotating light roast filter coffee with clean floral notes and cane sugar sweetness.',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
      isCoffeeSweet: false,
    },
    {
      name: 'Oat Flat White (Dual Origin)',
      category: 'Coffee',
      price: 5.0,
      description: 'Rich espresso extraction paired with micro-foamed Minor Figures oat milk.',
      image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80',
      isCoffeeSweet: false,
    },
    {
      name: 'Espresso Pistachio Mille-Feuille',
      category: 'Coffee Sweets',
      price: 11.5,
      description: 'Caramelised puff pastry layered with dark roast espresso cream and roasted Sicilian pistachio paste.',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      isCoffeeSweet: true,
    },
    {
      name: 'Geisha Cascara Affogato',
      category: 'Coffee Sweets',
      price: 10.0,
      description: 'Double shot of anaerobic honey Geisha pulled over Tahitian bean fior di latte gelato.',
      image: 'https://images.unsplash.com/photo-1592663527359-cf6642f54cff?auto=format&fit=crop&w=600&q=80',
      isCoffeeSweet: true,
    },
    {
      name: 'Coffee Basque Burnt Cheesecake',
      category: 'Coffee Sweets',
      price: 9.5,
      description: 'Creamy baked cheesecake infused with cold brew reduction and dark cocoa salt flakes.',
      image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
      isCoffeeSweet: true,
    },
    {
      name: 'Double Espresso Canelé',
      category: 'Coffee Sweets',
      price: 6.5,
      description: 'Crunchy beeswax crust with a soft custard interior perfumed with rum and washed Ethiopian espresso.',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      isCoffeeSweet: true,
    },
  ];

  for (const item of items) {
    await prisma.menuItem.create({ data: item });
  }

  console.log('Seeded menu and coffee sweets into Neon DB!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });