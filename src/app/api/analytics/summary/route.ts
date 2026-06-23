import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  // 1. Validar seguridad inter-servicios (Opcional pero recomendado)
  const apiKey = request.headers.get('x-api-key');
  if (process.env.ANALYTICS_API_KEY && apiKey !== process.env.ANALYTICS_API_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // 2. Obtener métricas globales usando agregaciones nativas de Prisma
    const [totalTransactions, revenueAggregation] = await Promise.all([
      prisma.transaction.count({
        where: { status: 'PAID' }
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' }
      })
    ]);

    const grossRevenue = revenueAggregation._sum.amount || 0;

    // Traemos TODAS las transacciones pagadas, ordenadas desde la más reciente
    const allPaidTransactions = await prisma.transaction.findMany({
      where: { status: 'PAID' },
      orderBy: { created_at: 'desc' },
      select: { amount: true, created_at: true }
    });

    const chartDataMap = new Map<string, number>();

    for (const tx of allPaidTransactions) {
      // Ignoramos transacciones de $0 si llegaran a existir (ej: productos gratuitos)
      if (tx.amount <= 0) continue; 

      const dateStr = tx.created_at.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
      
      if (chartDataMap.has(dateStr)) {
        // Si el día ya existe en el mapa, le sumamos el monto de esta transacción
        chartDataMap.set(dateStr, chartDataMap.get(dateStr)! + tx.amount);
      } else {
        // Es un día nuevo. Si ya registramos 7 días distintos, rompemos el bucle
        if (chartDataMap.size === 7) break;
        chartDataMap.set(dateStr, tx.amount);
      }
    }

    // 4. Convertir y ordenar
    // Convertimos el mapa al array de objetos que espera el Dashboard.
    // OJO: Como iteramos desde lo más nuevo a lo más viejo, el array quedó al revés.
    // Usamos .reverse() para que el gráfico de Recharts fluya cronológicamente de izquierda a derecha.
    const revenueChart = Array.from(chartDataMap, ([date, revenue]) => ({ date, revenue })).reverse();

    // 5. Devolver la estructura JSON exacta acordada
    return NextResponse.json({
      totalTransactions,
      grossRevenue,
      revenueChart
    }, { status: 200 });

  } catch (error) {
    console.error("Error generando analíticas:", error);
    return NextResponse.json({ error: "Error interno procesando métricas" }, { status: 500 });
  }
}