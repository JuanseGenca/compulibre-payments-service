// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

const projectRoot = process.cwd();

// 1. Cargamos las variables de entorno desde .env o .env.local
config({ path: path.resolve(projectRoot, '.env.local') });
config({ path: path.resolve(projectRoot, '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Leemos el archivo JSON desde la carpeta prisma
  const seedFilePath = path.resolve(projectRoot, 'prisma', 'seed-output.json');
  const rawData = fs.readFileSync(seedFilePath, 'utf8');
  const { paymentsOrders } = JSON.parse(rawData);

  console.log(`Iniciando importación de ${paymentsOrders.length} transacciones...`);

  for (const order of paymentsOrders) {
    // Usamos create en lugar de upsert
    await prisma.transaction.create({
      data: {
        external_order_reference: order.buyerOrderId,
        amount: order.amount,
        currency: 'ARS',
        // Mapeo directo de estados: si el status es PAYMENT_FAILED, guardamos FAILED
        status: order.status === 'PAYMENT_FAILED' ? 'REJECTED' : 'PAID',
        buyerId: order.buyerId,
        buyerAddress: 'Dirección provisoria',
        buyerCodigoPostal: 0,
        created_at: new Date(order.createdAt),
        items: {
          create: [{
            productId: order.externalProductId,
            name: order.productName,
            quantity: 1,
            unit_price: order.amount,
            sellerId: order.sellerId
          }]
        }
      },
    });
  }
  console.log('Importación completada con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });