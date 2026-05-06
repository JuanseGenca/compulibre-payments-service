import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { prisma } from "@/lib/prisma";

// 2. Inicializamos Mercado Pago
const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(request: Request) {
  try {
    // Mercado Pago manda información en los parámetros de la URL
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || url.searchParams.get('topic');
    const paymentId = url.searchParams.get('data.id') || url.searchParams.get('id');

    // Nos aseguramos de que el aviso sea sobre un pago y traiga un ID
    if (type === 'payment' && paymentId) {
      
      const paymentInfo = await new Payment(mpClient).get({ id: paymentId });

      // Si la plata ya está acreditada
      if (paymentInfo.status === 'approved') {
        
        //buscamos la transacción usando el external_reference y la marcamos como PAGADA
        await prisma.transaction.update({
          where: {
            id: paymentInfo.external_reference,
          },
          data: {
            status: 'PAID', // Pasamos de PENDING a PAID
          },
        });
        
        console.log(`Transacción ${paymentInfo.external_reference} cobrada con éxito!`);
      }
    }

    // 200 OK para Mercado Pago
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Error procesando el webhook de Mercado Pago:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}