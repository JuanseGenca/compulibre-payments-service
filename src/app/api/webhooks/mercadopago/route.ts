import { NextResponse } from 'next/server';
import { Payment } from 'mercadopago';
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

      let finalStatus: "PENDING" | "PAID" | "REJECTED" = 'PENDING';

      // Vemos que devuelve mercado pago
      if (paymentInfo.status === 'approved' ) {
        finalStatus = 'PAID';
      }else if (paymentInfo.status === 'rejected' || paymentInfo.status === 'cancelled') {
          finalStatus = 'REJECTED';
        }

      // Envolvemos todo en una transacción de Prisma para garantizar atomicidad.
      // Si el servidor se cae mientras actualiza los saldos, se revierte todo.
      const txRecord = await prisma.$transaction(async (tx) => {
        // Intentamos actualizar la transacción. Prisma solo lo hará si el estado NO es 'PAID'
        const updateResult = await tx.transaction.updateMany({
          where: {
            id: paymentInfo.external_reference,
            status: { not: 'PAID' } // <-- Esta condición evita el doble cobro
          },
          data: {
            status: finalStatus,
            payment_method: paymentInfo.payment_method_id, 
          }
        });

        // 2. Si count es 0, significa que ya estaba en PAID u otro estado final, es duplicado.
        if (updateResult.count === 0) {
          return null; // Retornamos null para avisar que es duplicado
        }

        // Traemos la transacción actualizada (con sus items) para hacer la orquestación.
        const txUpdated = await tx.transaction.findUnique({
          where: { id: paymentInfo.external_reference },
          include: { items: true }
        });

        if(txUpdated && finalStatus === 'PAID'){
          const gananciasPorVendedor: Record<string, number> = {};
          for (const item of txUpdated.items) {
            if (!gananciasPorVendedor[item.sellerId]) {
              gananciasPorVendedor[item.sellerId] = 0;
            }
            gananciasPorVendedor[item.sellerId] += (item.unit_price * item.quantity);
          }

          for (const sellerId in gananciasPorVendedor) {
            const ganancia = gananciasPorVendedor[sellerId];
      
            await tx.account.upsert({
              where: { clerk_user_id: sellerId },
              update: { balance: { increment: ganancia } },
              create: { clerk_user_id: sellerId, balance: ganancia }
            });
            console.log(`Saldo acreditado a ${sellerId}: +$${ganancia}`);
          }
        }
        
        return txUpdated;
      });

      // Si txRecord es null, fue ignorado por el updateMany
      if (!txRecord) {
        console.log(`Aviso duplicado ignorado para: ${paymentInfo.external_reference}`);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      //LLAMADAS A LAS APPS DE SELLER Y BUYER SEGÚN EL ESTADO
      if(txRecord){
        try {
          console.log("Iniciando orquestación simulada...");

          //Llamada a Buyer App
          const buyerResponse = await notifyBuyerApp({
            orderId: txRecord.external_order_reference,
            transactionId: txRecord.id,
            status: finalStatus,
            paymentMethod: txRecord.payment_method
         });

         if (buyerResponse.status === 200) {
              console.log("Buyer App actualizada. Estado:", buyerResponse.data.orderStatus);
            } else {
                  // Manejamos los errores documentados (400, 404, 500)
                  console.error(`Error en Buyer App (${buyerResponse.status}):`, buyerResponse.data.error);
                }
          
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

           if (confirmResponse.status === 200) {
            console.log("Seller App actualizada. Estado:", confirmResponse.data.status);
          } else {
                // Manejamos los errores documentados (400, 404, 500)
                console.error(`Error en Seller App (${confirmResponse.status}):`, confirmResponse.data.error);
              }
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
    //para que mp intente mas tarde
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }

  }
