import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Listar retiros (Paginado)
export async function GET(request: Request) {

    const apiKey = request.headers.get('x-api-key');
    if (process.env.PAYMENTS_API_KEY && apiKey !== process.env.PAYMENTS_API_KEY) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Paginación: Extraemos page y limit, con valores por defecto
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const whereClause = status ? { status: status as any } : {};

    // Ejecutamos la búsqueda y el conteo total en paralelo
    const [withdrawals, totalWithdrawals] = await Promise.all([
      prisma.payout.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: { id: 'desc' }
      }),
      prisma.payout.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalWithdrawals / limit);

    return NextResponse.json({
      withdrawals,
      pagination: {
        page,
        limit,
        totalWithdrawals,
        totalPages
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error obteniendo retiros:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PATCH: Aceptar o Rechazar un retiro 
export async function PATCH(request: Request) {

  const apiKey = request.headers.get('x-api-key');
    if (process.env.PAYMENTS_API_KEY && apiKey !== process.env.PAYMENTS_API_KEY) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

  try {
    const body = await request.json();
    const { payoutId, action } = body;

    if (!payoutId || (action !== 'COMPLETED' && action !== 'REJECTED')) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const payout = await tx.payout.findUnique({ where: { id: payoutId } });
      
      if (!payout) throw new Error("Retiro no encontrado");
      if (payout.status !== 'PROCESSING') throw new Error("El retiro ya fue procesado");

      const updatedPayout = await tx.payout.update({
        where: { id: payoutId },
        data: { status: action }
      });

      if (action === 'REJECTED') {
        await tx.account.update({
          where: { clerk_user_id: payout.account_id },
          data: { balance: { increment: payout.amount } }
        });
      }

      return updatedPayout;
    });

    return NextResponse.json({ success: true, withdrawal: result }, { status: 200 });
  } catch (error: any) {
    console.error("Error procesando retiro:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 400 });
  }
}