import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Listar tickets de soporte (Paginado)
export async function GET(request: Request) {

    const apiKey = request.headers.get('x-api-key');
    if (process.env.PAYMENTS_API_KEY && apiKey !== process.env.PAYMENTS_API_KEY) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
    
        // Paginación
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const skip = (page - 1) * limit;

        const whereClause = status ? { status: status as any } : {};

        // Búsqueda y conteo en paralelo
        const [tickets, totalTickets] = await Promise.all([
            prisma.supportTicket.findMany({
            where: whereClause,
            skip: skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.supportTicket.count({ where: whereClause })
        ]);

        const totalPages = Math.ceil(totalTickets / limit);

        return NextResponse.json({
            tickets,
            pagination: {
                page,
                limit,
                totalTickets,
                totalPages
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Error obteniendo tickets:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
        }
}

// PATCH: Cerrar o actualizar estado de un ticket (Lógica directa)
export async function PATCH(request: Request) {

    const apiKey = request.headers.get('x-api-key');
    if (process.env.PAYMENTS_API_KEY && apiKey !== process.env.PAYMENTS_API_KEY) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

  try {
    const body = await request.json();
    const { ticketId, action } = body;

    if (!ticketId || (action !== 'REVIEWING' && action !== 'CLOSED')) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: action }
    });

    return NextResponse.json({ success: true, ticket: updatedTicket }, { status: 200 });
  } catch (error) {
    console.error("Error actualizando ticket:", error);
    return NextResponse.json({ error: "Error interno o ticket no encontrado" }, { status: 500 });
  }
}