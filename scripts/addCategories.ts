import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Agregando nuevas categorías...');

  const newCategories = [
    {
      name: 'Otras',
      icon: '📦',
      color: 'bg-gray-500',
      description: 'Otras categorías de servicios'
    },
    {
      name: 'Albañilería',
      icon: '🧱',
      color: 'bg-stone-600',
      description: 'Servicios de construcción y albañilería'
    },
    {
      name: 'Herrería',
      icon: '⚒️',
      color: 'bg-gray-700',
      description: 'Servicios de herrería y metalurgia'
    },
    {
      name: 'Vidriería',
      icon: '🪟',
      color: 'bg-sky-600',
      description: 'Servicios de vidriería y cristalería'
    },
    {
      name: 'Limpieza de Alfombras',
      icon: '🧽',
      color: 'bg-cyan-600',
      description: 'Servicios de limpieza profunda de alfombras'
    },
    {
      name: 'Instalación de Aire Acondicionado',
      icon: '❄️',
      color: 'bg-blue-500',
      description: 'Instalación y mantenimiento de sistemas de aire acondicionado'
    },
    {
      name: 'Cerrajería',
      icon: '🔐',
      color: 'bg-slate-700',
      description: 'Servicios de cerrajería y seguridad'
    },
    {
      name: 'Diseño Gráfico',
      icon: '🎨',
      color: 'bg-violet-600',
      description: 'Servicios de diseño gráfico y visual'
    },
    {
      name: 'Marketing Digital',
      icon: '📊',
      color: 'bg-purple-600',
      description: 'Servicios de marketing digital y publicidad online'
    },
    {
      name: 'Contabilidad',
      icon: '📈',
      color: 'bg-green-700',
      description: 'Servicios contables y financieros'
    },
    {
      name: 'Legal',
      icon: '⚖️',
      color: 'bg-indigo-700',
      description: 'Servicios legales y asesoría jurídica'
    },
    {
      name: 'Fitness',
      icon: '💪',
      color: 'bg-red-700',
      description: 'Servicios de entrenamiento físico y fitness'
    },
    {
      name: 'Mascotas',
      icon: '🐾',
      color: 'bg-amber-500',
      description: 'Servicios para mascotas y cuidado animal'
    },
    {
      name: 'Reparación de Electrodomésticos',
      icon: '🔌',
      color: 'bg-orange-600',
      description: 'Reparación y mantenimiento de electrodomésticos'
    },
    {
      name: 'Tapicería',
      icon: '🪑',
      color: 'bg-amber-700',
      description: 'Servicios de tapicería y restauración de muebles'
    }
  ];

  const results = await Promise.all(
    newCategories.map(async (category) => {
      try {
        const result = await prisma.category.upsert({
          where: { name: category.name },
          update: {
            // Solo actualiza si la categoría ya existe pero está inactiva
            active: true
          },
          create: {
            ...category,
            active: true
          }
        });
        return { success: true, category: result.name, action: 'created/updated' };
      } catch (error) {
        return { success: false, category: category.name, error: String(error) };
      }
    })
  );

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✅ ${successful.length} categorías procesadas exitosamente:`);
  successful.forEach(r => console.log(`   - ${r.category}`));

  if (failed.length > 0) {
    console.log(`\n❌ ${failed.length} categorías con errores:`);
    failed.forEach(r => console.log(`   - ${r.category}: ${r.error}`));
  }

  console.log('\n✨ Proceso completado!');
}

main()
  .catch((error) => {
    console.error('❌ Error ejecutando el script:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

