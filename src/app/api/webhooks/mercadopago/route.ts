import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { prisma } from "@/lib/prisma";
import { mpClient } from '@/lib/mercadopago';
import { notifyBuyerApp, confirmOrderSellerApp } from '@/services/externalApps';

export async function POST(request: Request) {
  try {
    // Mercado Pago manda información en los parámetros de la URL
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || url.searchParams.get('topic');
    const paymentId = url.searchParams.get('data.id') || url.searchParams.get('id');

    // Nos aseguramos de que el aviso sea sobre un pago y traiga un ID
    if (type === 'payment' && paymentId) {
      
      const paymentInfo = await new Payment(mpClient).get({ id: paymentId });

      let finalStatus = 'PENDING';

      // Vemos que devuelve mercado pago
      if (paymentInfo.status === 'approved' ) {
        finalStatus = 'PAID';
      }else if (paymentInfo.status === 'rejected' || paymentInfo.status === 'cancelled') {
          finalStatus = 'REJECTED';
        }

      // Intentamos actualizar la transacción. Prisma solo lo hará si el estado NO es 'PAID'
      const updateResult = await prisma.transaction.updateMany({
        where: {
          id: paymentInfo.external_reference,
          status: { not: 'PAID' } // <-- Esta condición evita el doble cobro
        },
        data: {
          status: finalStatus,
          payment_method: paymentInfo.payment_method_id, 
        }
      });

      // 2. Si count es 0, significa que no actualizamos ningún registro porque ya estaba en PAID, por lo que es un aviso duplicado y lo ignoramos.
      if (updateResult.count === 0) {
        console.log(`Aviso duplicado ignorado para: ${paymentInfo.external_reference}`);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // si count no era 0
      // Traemos la transacción actualizada (con sus items) para hacer la orquestación.
      const txRecord = await prisma.transaction.findUnique({
        where: { id: paymentInfo.external_reference },
        include: { items: true }
      });

      if(txRecord && finalStatus === 'PAID'){

        const gananciasPorVendedor: Record<string, number> = {};
        for (const item of txRecord.items) {
          if (!gananciasPorVendedor[item.sellerId]) {
            gananciasPorVendedor[item.sellerId] = 0;
          }
          gananciasPorVendedor[item.sellerId] += (item.unit_price * item.quantity);
        }

        for (const sellerId in gananciasPorVendedor) {
          const ganancia = gananciasPorVendedor[sellerId];
    
          await prisma.account.upsert({
            where: { clerk_user_id: sellerId },
            update: { balance: { increment: ganancia } },
            create: { clerk_user_id: sellerId, balance: ganancia }
          });
          console.log(`Saldo acreditado a ${sellerId}: +$${ganancia}`);
        }
      }

      //LLAMADAS A LAS APPS DE SELLER Y BUYER SEGÚN EL ESTADO
      if(txRecord){
        try {
          console.log("Iniciando orquestación simulada...");

          //Llamada a Buyer App
          const buyerResponse = await notifyBuyerApp({
           transactionId: txRecord.id,
            status: finalStatus,
           paymentMethod: txRecord.payment_method
         });
          
         if(finalStatus === 'PAID'){
           // 2. Llamada a Seller App
            const confirmResponse = await confirmOrderSellerApp({
              orderReference: txRecord.external_order_reference,
              buyerId: txRecord.buyerId,
              items: txRecord.items,
              transactionId: txRecord.id,
              buyerAddress: txRecord.buyerAddress,
              buyerCodigoPostal: txRecord.buyerCodigoPostal
           });
          }
         console.log("Orquestación finalizada");

        } catch (error) {
          console.error("Error en orquestación:", error);
          }
      }
    }
    // 200 OK para Mercado Pago
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Error procesando el webhook de Mercado Pago:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }

  }
