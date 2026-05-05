import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client/extension';
//import { PrismaClient } from '@prisma/client';

// 1. Inicializamos Prisma con el adaptador de Postgres que configuramos antes
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 2. Inicializamos Mercado Pago con el token del .env
const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(request: Request) {
  try {
    // Leemos el body según el contrato de la API
    const body = await request.json();
    const { buyerId, sellerId, orderReference, amount, currency, itemsDescription } = body;

    // 3. Guardamos la transacción en estado PENDING en nuestra base de datos
    const transaction = await prisma.transaction.create({
      data: {
        external_order_reference: orderReference,
        amount: amount,
        currency: currency,
        sellerId: sellerId,
        status: 'PENDING',
      },
    });

    // 4. Creamos la preferencia de pago en Mercado Pago
    const preference = new Preference(mpClient);
    const result = await preference.create({
      body: {
        items: [
          {
            id: orderReference,
            title: itemsDescription,
            quantity: 1,
            unit_price: amount,
            currency_id: currency,
          },
        ],
        external_reference: transaction.id, // Clave: MP nos devuelve este ID en el webhook
        // notification_url: `${process.env.PUBLIC_URL}/api/webhooks/mercadopago`, // Lo activaremos luego
      },
    });

    // 5. Devolvemos la respuesta exacta que espera la Buyer App
    return NextResponse.json({
      transactionId: transaction.id,
      checkoutUrl: result.sandbox_init_point,
    }, { status: 200 });

  } catch (error) {
    console.error('Error procesando checkout:', error);
    return NextResponse.json(
      { error: 'Error interno procesando el pago' }, 
      { status: 500 }
    );
  }
}