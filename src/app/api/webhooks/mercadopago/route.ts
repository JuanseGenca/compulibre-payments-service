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
      
      //recupero la transaccion
      const txOriginal = await prisma.transaction.findUnique({
      where: { id: paymentInfo.external_reference },
      });

      // Vemos que devuelve mercado pago
      if (paymentInfo.status === 'approved' ) {
        finalStatus = 'PAID';
        console.log(`Transacción ${paymentInfo.external_reference} cobrada con éxito!`);
      }else if (paymentInfo.status === 'rejected' || paymentInfo.status === 'cancelled') {
          finalStatus = 'REJECTED';
        }

      //Si la transacción existe y no esta paid, actualizamos el estado y actualizamos el saldo del vendedor si corresponde
      if(txOriginal && txOriginal.status !== 'PAID'){
        //buscamos la transacción usando el external_reference y actualizamos
        const txRecord = await prisma.transaction.update({
          where: {
           id: paymentInfo.external_reference,
          },
          data: {
            status: finalStatus,
            payment_method: paymentInfo.payment_method_id, 
          },
          include: {
            items: true
          }
        });
        
        if(finalStatus === 'PAID'){
          //ACREDITAMOS AL VENDEDOR
          await prisma.account.upsert({
            where: { clerk_user_id: txRecord.sellerId },
            update: { balance: { increment: txRecord.amount } },
            create: { clerk_user_id: txRecord.sellerId, balance: txRecord.amount }
          })

          console.log(`Saldo acreditado a ${txRecord.sellerId}: +$${txRecord.amount}`);
        }

        //LLAMADAS A LAS APPS DE SELLER Y BUYER SEGÚN EL ESTADO
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
              transactionId: txRecord.id
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
