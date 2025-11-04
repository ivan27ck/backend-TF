import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuarios de prueba
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    // Usuarios originales
    prisma.user.upsert({
      where: { email: 'carlos.hernandez@email.com' },
      update: {},
      create: {
        email: 'carlos.hernandez@email.com',
        passwordHash,
        name: 'Ing. Carlos Hernández',
        profession: 'Plomero Profesional',
        location: 'Guadalajara, Jalisco',
        experience: '15 años de experiencia',
        avatar: '🔧',
        rating: 4.9,
        reviewsCount: 127,
        completedJobs: 85,
        verified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'ana.martinez@email.com' },
      update: {},
      create: {
        email: 'ana.martinez@email.com',
        passwordHash,
        name: 'Ana Martínez Silva',
        profession: 'Fotógrafa Profesional',
        location: 'Ciudad de México',
        experience: '8 años de experiencia',
        avatar: '📸',
        rating: 4.9,
        reviewsCount: 89,
        completedJobs: 156,
        verified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'miguel.torres@email.com' },
      update: {},
      create: {
        email: 'miguel.torres@email.com',
        passwordHash,
        name: 'Ing. Miguel Torres Vega',
        profession: 'Electricista Certificado',
        location: 'Monterrey, Nuevo León',
        experience: '12 años de experiencia',
        avatar: '⚡',
        rating: 4.7,
        reviewsCount: 98,
        completedJobs: 203,
        verified: true
      }
    }),
    // Nuevos usuarios
    prisma.user.upsert({
      where: { email: 'mariachi.charros@email.com' },
      update: {},
      create: {
        email: 'mariachi.charros@email.com',
        passwordHash,
        name: 'Mariachi Los Charros de México',
        profession: 'Músico Profesional',
        location: 'Guadalajara, Jalisco',
        experience: '20 años de experiencia',
        avatar: '🎺',
        rating: 4.8,
        reviewsCount: 156,
        completedJobs: 342,
        verified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'jose.ramirez@email.com' },
      update: {},
      create: {
        email: 'jose.ramirez@email.com',
        passwordHash,
        name: 'José Luis Ramírez',
        profession: 'Carpintero Artesanal',
        location: 'Puebla, Puebla',
        experience: '18 años de experiencia',
        avatar: '🪵',
        rating: 4.6,
        reviewsCount: 73,
        completedJobs: 124,
        verified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'maria.gonzalez@email.com' },
      update: {},
      create: {
        email: 'maria.gonzalez@email.com',
        passwordHash,
        name: 'María González',
        profession: 'Diseñadora Gráfica',
        location: 'Querétaro, Querétaro',
        experience: '10 años de experiencia',
        avatar: '🎨',
        rating: 4.8,
        reviewsCount: 112,
        completedJobs: 267,
        verified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'dj.carlos@email.com' },
      update: {},
      create: {
        email: 'dj.carlos@email.com',
        passwordHash,
        name: 'DJ Carlos "El Mix"',
        profession: 'DJ Profesional',
        location: 'Tijuana, Baja California',
        experience: '8 años de experiencia',
        avatar: '🎧',
        rating: 4.7,
        reviewsCount: 89,
        completedJobs: 156,
        verified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'banda.rock@email.com' },
      update: {},
      create: {
        email: 'banda.rock@email.com',
        passwordHash,
        name: 'Banda Rock "Los Desconocidos"',
        profession: 'Banda Musical',
        location: 'Monterrey, Nuevo León',
        experience: '5 años de experiencia',
        avatar: '🎸',
        rating: 4.5,
        reviewsCount: 67,
        completedJobs: 89,
        verified: false
      }
    }),
    prisma.user.upsert({
      where: { email: 'chef.roberto@email.com' },
      update: {},
      create: {
        email: 'chef.roberto@email.com',
        passwordHash,
        name: 'Chef Roberto Mendoza',
        profession: 'Chef Privado',
        location: 'Cancún, Quintana Roo',
        experience: '12 años de experiencia',
        avatar: '👨‍🍳',
        rating: 4.9,
        reviewsCount: 134,
        completedJobs: 245,
        verified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'limpieza.rosa@email.com' },
      update: {},
      create: {
        email: 'limpieza.rosa@email.com',
        passwordHash,
        name: 'Limpieza Express "Doña Rosa"',
        profession: 'Servicios de Limpieza',
        location: 'Mérida, Yucatán',
        experience: '6 años de experiencia',
        avatar: '🧹',
        rating: 4.6,
        reviewsCount: 78,
        completedJobs: 156,
        verified: false
      }
    }),
    prisma.user.upsert({
      where: { email: 'teacher.mike@email.com' },
      update: {},
      create: {
        email: 'teacher.mike@email.com',
        passwordHash,
        name: 'Tutor de Inglés "Teacher Mike"',
        profession: 'Profesor de Inglés',
        location: 'Guadalajara, Jalisco',
        experience: '7 años de experiencia',
        avatar: '📚',
        rating: 4.8,
        reviewsCount: 95,
        completedJobs: 178,
        verified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'mecanico.gordo@email.com' },
      update: {},
      create: {
        email: 'mecanico.gordo@email.com',
        passwordHash,
        name: 'Mecánico "El Gordo"',
        profession: 'Mecánico Automotriz',
        location: 'León, Guanajuato',
        experience: '15 años de experiencia',
        avatar: '🔧',
        rating: 4.7,
        reviewsCount: 112,
        completedJobs: 289,
        verified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'pintor.colorin@email.com' },
      update: {},
      create: {
        email: 'pintor.colorin@email.com',
        passwordHash,
        name: 'Pintor "El Colorín"',
        profession: 'Pintor de Casas',
        location: 'Aguascalientes, Aguascalientes',
        experience: '10 años de experiencia',
        avatar: '🎨',
        rating: 4.5,
        reviewsCount: 67,
        completedJobs: 134,
        verified: false
      }
    }),
    prisma.user.upsert({
      where: { email: 'jardinero.verde@email.com' },
      update: {},
      create: {
        email: 'jardinero.verde@email.com',
        passwordHash,
        name: 'Jardinero "Don Verde"',
        profession: 'Jardinero Profesional',
        location: 'San Luis Potosí, SLP',
        experience: '8 años de experiencia',
        avatar: '🌱',
        rating: 4.4,
        reviewsCount: 45,
        completedJobs: 89,
        verified: false
      }
    }),
    prisma.user.upsert({
      where: { email: 'tatuador.ink@email.com' },
      update: {},
      create: {
        email: 'tatuador.ink@email.com',
        passwordHash,
        name: 'Tatuador "Ink Master"',
        profession: 'Tatuador Profesional',
        location: 'Tijuana, Baja California',
        experience: '6 años de experiencia',
        avatar: '💉',
        rating: 4.8,
        reviewsCount: 89,
        completedJobs: 167,
        verified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'barbero.clasico@email.com' },
      update: {},
      create: {
        email: 'barbero.clasico@email.com',
        passwordHash,
        name: 'Barbero "El Clásico"',
        profession: 'Barbero Tradicional',
        location: 'México, CDMX',
        experience: '12 años de experiencia',
        avatar: '✂️',
        rating: 4.6,
        reviewsCount: 78,
        completedJobs: 234,
        verified: false
      }
    }),
    prisma.user.upsert({
      where: { email: 'tech.fix@email.com' },
      update: {},
      create: {
        email: 'tech.fix@email.com',
        passwordHash,
        name: 'Reparador de Celulares "Tech Fix"',
        profession: 'Técnico en Celulares',
        location: 'Monterrey, Nuevo León',
        experience: '5 años de experiencia',
        avatar: '📱',
        rating: 4.7,
        reviewsCount: 92,
        completedJobs: 145,
        verified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'traductor.poly@email.com' },
      update: {},
      create: {
        email: 'traductor.poly@email.com',
        passwordHash,
        name: 'Traductor "Polyglot"',
        profession: 'Traductor Profesional',
        location: 'Guadalajara, Jalisco',
        experience: '9 años de experiencia',
        avatar: '🌍',
        rating: 4.9,
        reviewsCount: 67,
        completedJobs: 123,
        verified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'party.pro@email.com' },
      update: {},
      create: {
        email: 'party.pro@email.com',
        passwordHash,
        name: 'Organizador de Eventos "Party Pro"',
        profession: 'Organizador de Eventos',
        location: 'Cancún, Quintana Roo',
        experience: '7 años de experiencia',
        avatar: '🎉',
        rating: 4.8,
        reviewsCount: 89,
        completedJobs: 156,
        verified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'yoga.zen@email.com' },
      update: {},
      create: {
        email: 'yoga.zen@email.com',
        passwordHash,
        name: 'Instructor de Yoga "Zen Master"',
        profession: 'Instructor de Yoga',
        location: 'Puerto Vallarta, Jalisco',
        experience: '8 años de experiencia',
        avatar: '🧘‍♀️',
        rating: 4.7,
        reviewsCount: 73,
        completedJobs: 134,
        verified: false
      }
    })
  ]);

  console.log(`✅ ${users.length} usuarios creados/actualizados`);

  // Crear servicios para cada usuario
  const services = await Promise.all([
    // Servicios originales
    prisma.service.create({
      data: {
        userId: users[0].id,
        title: 'Servicios de Plomería Profesional',
        description: 'Instalación, reparación y mantenimiento de sistemas hidráulicos con garantía de calidad y atención 24/7. Especializado en sistemas residenciales y comerciales.',
        category: 'Plomería',
        price: 'Desde $350 MXN',
        location: 'Guadalajara, Jalisco',
        images: ['🚿', '🔧', '🏠'],
        verified: true,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[1].id,
        title: 'Fotografía Profesional de Eventos',
        description: 'Captura de momentos únicos con equipos de alta gama y técnicas avanzadas de composición fotográfica. Especializada en bodas, eventos corporativos y sesiones familiares.',
        category: 'Fotografía',
        price: 'Desde $2,800 MXN',
        location: 'Ciudad de México',
        images: ['📷', '💒', '🎉'],
        verified: true,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[2].id,
        title: 'Instalaciones Eléctricas Certificadas',
        description: 'Servicios eléctricos especializados con certificación oficial y cumplimiento de normas de seguridad. Instalaciones residenciales, comerciales e industriales.',
        category: 'Electricidad',
        price: 'Desde $450 MXN',
        location: 'Monterrey, Nuevo León',
        images: ['💡', '🔌', '⚡'],
        verified: true,
        status: 'active'
      }
    }),
    // Nuevos servicios
    prisma.service.create({
      data: {
        userId: users[3].id,
        title: 'Conjunto Musical Mariachi Tradicional',
        description: 'Agrupación musical profesional especializada en repertorio tradicional mexicano para eventos especiales. Disponible para bodas, cumpleaños y eventos corporativos.',
        category: 'Música',
        price: 'Desde $2,200 MXN',
        location: 'Guadalajara, Jalisco',
        images: ['🎵', '🎺', '🎻'],
        verified: true,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[4].id,
        title: 'Carpintería Artesanal Personalizada',
        description: 'Muebles y estructuras de madera hechos a medida con técnicas tradicionales y materiales de primera calidad. Diseños únicos y acabados profesionales.',
        category: 'Carpintería',
        price: 'Desde $1,200 MXN',
        location: 'Puebla, Puebla',
        images: ['🪑', '🪵', '🔨'],
        verified: true,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[5].id,
        title: 'Diseño Gráfico y Branding Corporativo',
        description: 'Creación de identidades visuales completas, logos, material publicitario y estrategias de marca para empresas y emprendedores.',
        category: 'Arte',
        price: 'Desde $1,800 MXN',
        location: 'Querétaro, Querétaro',
        images: ['🎨', '💻', '📱'],
        verified: true,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[6].id,
        title: 'DJ Profesional para Eventos',
        description: 'Animación musical profesional con equipos de sonido de alta calidad. Especializado en fiestas, bodas, eventos corporativos y celebraciones privadas.',
        category: 'Música',
        price: 'Desde $1,500 MXN',
        location: 'Tijuana, Baja California',
        images: ['🎧', '🎵', '🎉'],
        verified: true,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[7].id,
        title: 'Banda Rock para Eventos',
        description: 'Banda de rock en vivo para eventos especiales. Repertorio variado desde clásicos hasta música actual. Perfecto para fiestas, eventos corporativos y celebraciones.',
        category: 'Música',
        price: 'Desde $3,500 MXN',
        location: 'Monterrey, Nuevo León',
        images: ['🎸', '🎤', '🥁'],
        verified: false,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[8].id,
        title: 'Chef Privado a Domicilio',
        description: 'Servicio de chef privado para eventos especiales, cenas románticas, fiestas y eventos corporativos. Cocina internacional y mexicana tradicional.',
        category: 'Cocina',
        price: 'Desde $2,500 MXN',
        location: 'Cancún, Quintana Roo',
        images: ['👨‍🍳', '🍽️', '🥘'],
        verified: true,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[9].id,
        title: 'Servicios de Limpieza Residencial',
        description: 'Limpieza profunda de hogares, oficinas y espacios comerciales. Incluye limpieza de cocina, baños, dormitorios y áreas comunes.',
        category: 'Limpieza',
        price: 'Desde $400 MXN',
        location: 'Mérida, Yucatán',
        images: ['🧹', '🧽', '🏠'],
        verified: false,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[10].id,
        title: 'Clases de Inglés Particulares',
        description: 'Clases de inglés personalizadas para todos los niveles. Preparación para exámenes TOEFL, IELTS y conversación práctica. Método comunicativo.',
        category: 'Educación',
        price: 'Desde $200 MXN/hora',
        location: 'Guadalajara, Jalisco',
        images: ['📚', '🎓', '💬'],
        verified: true,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[11].id,
        title: 'Servicios Mecánicos Automotrices',
        description: 'Reparación y mantenimiento de vehículos. Diagnóstico computarizado, cambio de aceite, frenos, suspensión y reparaciones generales.',
        category: 'Automotriz',
        price: 'Desde $300 MXN',
        location: 'León, Guanajuato',
        images: ['🚗', '🔧', '⚙️'],
        verified: true,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[12].id,
        title: 'Pintura de Casas y Oficinas',
        description: 'Servicios de pintura interior y exterior. Preparación de superficies, aplicación de pinturas de calidad y acabados profesionales.',
        category: 'Pintura',
        price: 'Desde $800 MXN',
        location: 'Aguascalientes, Aguascalientes',
        images: ['🎨', '🏠', '🖌️'],
        verified: false,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[13].id,
        title: 'Servicios de Jardinería y Paisajismo',
        description: 'Diseño, instalación y mantenimiento de jardines. Poda de árboles, instalación de sistemas de riego y decoración con plantas.',
        category: 'Jardinería',
        price: 'Desde $500 MXN',
        location: 'San Luis Potosí, SLP',
        images: ['🌱', '🌿', '🌳'],
        verified: false,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[14].id,
        title: 'Tatuajes Personalizados',
        description: 'Diseño y aplicación de tatuajes únicos. Estilos variados: tradicional, minimalista, geométrico y personalizado según tus ideas.',
        category: 'Tatuajes',
        price: 'Desde $800 MXN',
        location: 'Tijuana, Baja California',
        images: ['💉', '🎨', '🖤'],
        verified: true,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[15].id,
        title: 'Cortes de Cabello Clásicos y Modernos',
        description: 'Cortes de cabello para hombres, barbas y peinados. Técnicas tradicionales y modernas. Atención personalizada y consulta de estilo.',
        category: 'Belleza',
        price: 'Desde $150 MXN',
        location: 'México, CDMX',
        images: ['✂️', '💈', '👨'],
        verified: false,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[16].id,
        title: 'Reparación de Celulares y Tablets',
        description: 'Reparación de pantallas, baterías, puertos de carga y problemas de software. Garantía en repuestos y servicio técnico especializado.',
        category: 'Tecnología',
        price: 'Desde $200 MXN',
        location: 'Monterrey, Nuevo León',
        images: ['📱', '🔧', '💻'],
        verified: true,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[17].id,
        title: 'Servicios de Traducción Profesional',
        description: 'Traducción de documentos, sitios web y contenido multimedia. Idiomas: inglés, francés, alemán, italiano y portugués.',
        category: 'Traducción',
        price: 'Desde $500 MXN',
        location: 'Guadalajara, Jalisco',
        images: ['🌍', '📄', '💬'],
        verified: true,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[18].id,
        title: 'Organización de Eventos Especiales',
        description: 'Planeación y coordinación completa de eventos: bodas, cumpleaños, eventos corporativos y celebraciones especiales.',
        category: 'Eventos',
        price: 'Desde $3,000 MXN',
        location: 'Cancún, Quintana Roo',
        images: ['🎉', '🎊', '🎈'],
        verified: true,
        status: 'active'
      }
    }),
    prisma.service.create({
      data: {
        userId: users[19].id,
        title: 'Clases de Yoga Personalizadas',
        description: 'Clases de yoga privadas y grupales. Vinyasa, Hatha, Yin y Yoga para principiantes. Incluye meditación y técnicas de respiración.',
        category: 'Bienestar',
        price: 'Desde $250 MXN/hora',
        location: 'Puerto Vallarta, Jalisco',
        images: ['🧘‍♀️', '🧘‍♂️', '🌸'],
        verified: false,
        status: 'active'
      }
    })
  ]);

  console.log(`✅ ${services.length} servicios creados`);

  // Crear categorías
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Plomería' },
      update: {},
      create: {
        name: 'Plomería',
        icon: '🔧',
        color: 'bg-slate-600',
        description: 'Servicios de plomería y fontanería',
        active: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Electricidad' },
      update: {},
      create: {
        name: 'Electricidad',
        icon: '⚡',
        color: 'bg-amber-600',
        description: 'Servicios eléctricos y de instalación',
        active: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Carpintería' },
      update: {},
      create: {
        name: 'Carpintería',
        icon: '🪵',
        color: 'bg-orange-700',
        description: 'Trabajos de carpintería y muebles',
        active: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Fotografía' },
      update: {},
      create: {
        name: 'Fotografía',
        icon: '📸',
        color: 'bg-indigo-600',
        description: 'Servicios de fotografía profesional',
        active: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Música' },
      update: {},
      create: {
        name: 'Música',
        icon: '🎵',
        color: 'bg-rose-600',
        description: 'Servicios musicales y entretenimiento',
        active: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Arte' },
      update: {},
      create: {
        name: 'Arte',
        icon: '🎨',
        color: 'bg-emerald-600',
        description: 'Servicios artísticos y creativos',
        active: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Cocina' },
      update: {},
      create: {
        name: 'Cocina',
        icon: '👨‍🍳',
        color: 'bg-red-600',
        description: 'Servicios de cocina y gastronomía',
        active: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Limpieza' },
      update: {},
      create: {
        name: 'Limpieza',
        icon: '🧹',
        color: 'bg-blue-600',
        description: 'Servicios de limpieza y mantenimiento',
        active: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Educación' },
      update: {},
      create: {
        name: 'Educación',
        icon: '📚',
        color: 'bg-purple-600',
        description: 'Servicios educativos y de tutoría',
        active: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Automotriz' },
      update: {},
      create: {
        name: 'Automotriz',
        icon: '🚗',
        color: 'bg-gray-600',
        description: 'Servicios automotrices y mecánicos',
        active: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Pintura' },
      update: {},
      create: {
        name: 'Pintura',
        icon: '🎨',
        color: 'bg-yellow-600',
        description: 'Servicios de pintura y decoración',
        active: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Jardinería' },
      update: {},
      create: {
        name: 'Jardinería',
        icon: '🌱',
        color: 'bg-green-600',
        description: 'Servicios de jardinería y paisajismo',
        active: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Tatuajes' },
      update: {},
      create: {
        name: 'Tatuajes',
        icon: '💉',
        color: 'bg-black',
        description: 'Servicios de tatuajes y body art',
        active: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Belleza' },
      update: {},
      create: {
        name: 'Belleza',
        icon: '✂️',
        color: 'bg-pink-600',
        description: 'Servicios de belleza y estética',
        active: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Tecnología' },
      update: {},
      create: {
        name: 'Tecnología',
        icon: '📱',
        color: 'bg-cyan-600',
        description: 'Servicios tecnológicos y reparación',
        active: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Traducción' },
      update: {},
      create: {
        name: 'Traducción',
        icon: '🌍',
        color: 'bg-teal-600',
        description: 'Servicios de traducción e interpretación',
        active: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Eventos' },
      update: {},
      create: {
        name: 'Eventos',
        icon: '🎉',
        color: 'bg-fuchsia-600',
        description: 'Organización y servicios de eventos',
        active: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Bienestar' },
      update: {},
      create: {
        name: 'Bienestar',
        icon: '🧘‍♀️',
        color: 'bg-lime-600',
        description: 'Servicios de bienestar y salud',
        active: true
      }
    })
  ]);

  console.log(`✅ ${categories.length} categorías creadas/actualizadas`);

  // Crear algunas reseñas de prueba
  await Promise.all([
    prisma.review.create({
      data: {
        reviewerId: users[1].id,
        reviewedUserId: users[0].id,
        serviceId: services[0].id,
        rating: 5,
        comment: 'Excelente trabajo, muy profesional y puntual. Recomendado 100%.'
      }
    }),
    prisma.review.create({
      data: {
        reviewerId: users[2].id,
        reviewedUserId: users[1].id,
        serviceId: services[1].id,
        rating: 5,
        comment: 'Fotos increíbles, capturó perfectamente el momento. Muy satisfecho.'
      }
    }),
    prisma.review.create({
      data: {
        reviewerId: users[0].id,
        reviewedUserId: users[8].id,
        serviceId: services[8].id,
        rating: 5,
        comment: 'Chef excepcional, la comida estuvo deliciosa y el servicio impecable.'
      }
    }),
    prisma.review.create({
      data: {
        reviewerId: users[5].id,
        reviewedUserId: users[6].id,
        serviceId: services[6].id,
        rating: 4,
        comment: 'Muy buen DJ, animó perfectamente la fiesta. Recomendado.'
      }
    })
  ]);

  // Crear algunos mensajes de prueba
  await Promise.all([
    prisma.message.create({
      data: {
        senderId: users[1].id,
        receiverId: users[0].id,
        serviceId: services[0].id,
        content: 'Hola Carlos, me interesa tu servicio de plomería. ¿Estás disponible para el próximo fin de semana?'
      }
    }),
    prisma.message.create({
      data: {
        senderId: users[0].id,
        receiverId: users[1].id,
        serviceId: services[1].id,
        content: 'Hola Ana, necesito fotografía para un evento corporativo. ¿Podrías enviarme tu portafolio?'
      }
    }),
    prisma.message.create({
      data: {
        senderId: users[10].id,
        receiverId: users[8].id,
        serviceId: services[8].id,
        content: 'Hola Chef Roberto, me interesa contratarte para una cena romántica. ¿Tienes disponibilidad?'
      }
    })
  ]);

  console.log('✅ Seed completado exitosamente!');
  console.log(`👥 Usuarios creados: ${users.length}`);
  console.log(`🔧 Servicios creados: ${services.length}`);
  console.log('📝 Reseñas y mensajes de prueba creados');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
