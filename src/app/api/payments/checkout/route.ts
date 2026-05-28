import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { prisma } from "@/lib/prisma";
import { mpClient } from '@/lib/mercadopago';

interface ItemCarrito {
  productId: string;
  name: string;
  quantity: number;
  unit_price: number;
  sellerId: string;
}

export async function POST(request: Request) {
  try {

    // 1. Extraemos la llave del encabezado personalizado 'x-api-key'
    const apiKey = request.headers.get("x-api-key");

    // 2. Comparamos con la llave de nuestro entorno
    if (!apiKey || apiKey !== process.env.PAYMENTS_API_KEY) {
      return NextResponse.json(
        { error: "Acceso denegado. API Key inválida o faltante." },
        { status: 401 } // 401 Unauthorized
      );
    }

    // Leemos el body según el contrato de la API
    const body = await request.json();
    const { buyerId, buyerAddress, buyerCodigoPostal, orderReference, amount, currency, items} = body;

    if (!buyerId || !amount || !items || !Array.isArray(items) || items.length === 0 || !buyerAddress || !buyerCodigoPostal) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios o el carrito está vacío." }, 
        { status: 400 } // 400 Bad Request
      );
    }

    // 3. Guardamos la transacción en estado PENDING en nuestra base de datos
    const transaction = await prisma.transaction.create({
      data: {
        external_order_reference: orderReference,
        amount: amount,
        currency: currency,
        status: 'PENDING',
        buyerId: buyerId,
        buyerAddress: buyerAddress,
        buyerCodigoPostal: buyerCodigoPostal,
        items: {
          create: items.map((item: ItemCarrito) => ({
            sellerId: item.sellerId,
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            unit_price: item.unit_price 
          }))
        },
      },
    });

    // 4. Creamos la preferencia de pago en Mercado Pago
    const preference = new Preference(mpClient);
    const mpItems = body.items.map((item: ItemCarrito) => ({
       id: item.productId,
       title: item.name,
       quantity: item.quantity,
       unit_price: item.unit_price, 
       currency_id: currency || "ARS",
    }));

    const webhookUrl = process.env.WEBHOOK_URL;

    const result = await preference.create({
      body: {
        items: mpItems, 
        external_reference: transaction.id,
        notification_url: webhookUrl,
      },
    });

    // 5. Devolvemos la respuesta exacta que espera la Buyer App
    return NextResponse.json({
      transactionId: transaction.id,
      checkoutUrl: result.init_point,
    }, { status: 200 });

  } catch (error) {
    console.error('Error procesando checkout:', error);
    return NextResponse.json(
      { error: 'Error interno procesando el pago' }, 
      { status: 500 }
    );
  }
}