import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_OLD_HOST = 'http://localhost:10000';
const DEFAULT_NEW_HOST = process.env.API_URL ?? 'https://backend-tf-1.onrender.com';
const DEFAULT_OLD_STATIC_PATH = '/src/assets/servicios-prueba/';
const DEFAULT_NEW_STATIC_PATH = '/servicios-prueba/';

const oldHost = process.env.OLD_IMAGE_HOST ?? DEFAULT_OLD_HOST;
const newHost = process.env.NEW_IMAGE_HOST ?? DEFAULT_NEW_HOST;
const oldStaticPath = process.env.OLD_STATIC_IMAGE_PATH ?? DEFAULT_OLD_STATIC_PATH;
const newStaticPath = process.env.NEW_STATIC_IMAGE_PATH ?? DEFAULT_NEW_STATIC_PATH;

function escapeLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

async function run() {
  if (!oldHost || !newHost) {
    throw new Error('OLD_IMAGE_HOST y NEW_IMAGE_HOST deben estar definidos');
  }

  if (!oldStaticPath || !newStaticPath) {
    throw new Error('OLD_STATIC_IMAGE_PATH y NEW_STATIC_IMAGE_PATH deben estar definidos');
  }

  console.log('🔄 Reemplazando URLs de imágenes');
  console.log(`   Host origen: ${oldHost}`);
  console.log(`   Host destino: ${newHost}`);
  console.log(`   Ruta estática origen: ${oldStaticPath}`);
  console.log(`   Ruta estática destino: ${newStaticPath}`);

  const escapedOld = escapeLiteral(oldHost);
  const escapedNew = escapeLiteral(newHost);
  const escapedOldStatic = escapeLiteral(oldStaticPath);
  const escapedNewStatic = escapeLiteral(newStaticPath);

  const queries: Array<{ description: string; sql: string }> = [];

  if (oldHost !== newHost) {
    queries.push(
      {
        description: 'Service.mainImage (host)',
        sql: `
        UPDATE "Service"
        SET "mainImage" = REPLACE("mainImage", '${escapedOld}', '${escapedNew}')
        WHERE "mainImage" LIKE '${escapedOld}%';
      `
      },
      {
        description: 'Service.images (JSON, host)',
        sql: `
        UPDATE "Service"
        SET "images" = REPLACE("images"::text, '${escapedOld}', '${escapedNew}')::json
        WHERE "images"::text LIKE '%${escapedOld}%';
      `
      },
      {
        description: 'User.avatar (host)',
        sql: `
        UPDATE "User"
        SET "avatar" = REPLACE("avatar", '${escapedOld}', '${escapedNew}')
        WHERE "avatar" LIKE '${escapedOld}%';
      `
      }
    );
  }

  if (oldStaticPath !== newStaticPath) {
    queries.push(
      {
        description: 'Service.mainImage (ruta estática)',
        sql: `
        UPDATE "Service"
        SET "mainImage" = REPLACE("mainImage", '${escapedOldStatic}', '${escapedNewStatic}')
        WHERE "mainImage" LIKE '%${escapedOldStatic}%';
      `
      },
      {
        description: 'Service.images (JSON, ruta estática)',
        sql: `
        UPDATE "Service"
        SET "images" = REPLACE("images"::text, '${escapedOldStatic}', '${escapedNewStatic}')::json
        WHERE "images"::text LIKE '%${escapedOldStatic}%';
      `
      },
      {
        description: 'User.avatar (ruta estática)',
        sql: `
        UPDATE "User"
        SET "avatar" = REPLACE("avatar", '${escapedOldStatic}', '${escapedNewStatic}')
        WHERE "avatar" LIKE '%${escapedOldStatic}%';
      `
      }
    );
  }

  if (!queries.length) {
    console.log('No hay diferencias en host ni rutas estáticas; nada que actualizar.');
    return;
  }

  for (const { description, sql } of queries) {
    const result = await prisma.$executeRawUnsafe(sql);
    console.log(`   ✅ ${description}: ${result} fila(s) actualizada(s)`);
  }

  console.log('✨ Listo. Verifica los cambios en tu base antes de cerrar.');
}

run()
  .catch((error) => {
    console.error('❌ Error ejecutando el script:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

